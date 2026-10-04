import { system, world } from "@minecraft/server";
import { CustomForm, MessageBox, ObservableBoolean, ObservableString } from "@minecraft/server-ui";
import { variables } from "@minecraft/server-admin";
import { NAME,VERSION,PROVIDER_ID,PROTOCOL,CONSUMER_ID,CONFIG_SCHEMA_VERSION,CHUNK_SIZE,MAX_QUEUE,MAX_PER_TICK,REQUEST_TIMEOUT_TICKS,SYNC_DEBOUNCE_TICKS,EVENT_REFRESH_COOLDOWN_TICKS,WATCHDOG_SYNC_TICKS } from "./core/constants.js";

const chunks=new Map(), pending=new Map(), eventQueue=[];
let seq=0, revision=0, apiSeen=false, apiStatus=null, syncing=false, syncQueued=false, syncDebounce=null, eventRefreshCooldown=false, lastSnapshotFingerprint="";
const endpointCache=new Map();
let phase="starting", hasSnapshot=false, enrichmentGeneration=0, enrichmentActive=0;
let lastSync={servers:0,destinations:0,players:0,self:"",managedSelf:false,time:0,error:"",operation:"",httpStatus:0,responseStatus:"",rejected:0};
const metrics={queued:0,processed:0,dropped:0,malformed:0,requests:0,responses:0,timeouts:0,unmatched:0,highWater:0};
const clean=v=>`${v??""}`.trim();

const CONFIG_PROPERTY="transferui:bsm_provider_config_v1";
let discoveredServersCache=[];
function defaultProviderConfig(){return {schemaVersion:CONFIG_SCHEMA_VERSION,localServer:"",defaultInclude:true,servers:{}}}
function loadProviderConfig(){
  try{
    const raw=world.getDynamicProperty(CONFIG_PROPERTY);
    if(typeof raw!=="string"||!raw)return defaultProviderConfig();
    const x=JSON.parse(raw);
    return {schemaVersion:CONFIG_SCHEMA_VERSION,localServer:clean(x?.localServer),defaultInclude:x?.defaultInclude!==false,servers:x?.servers&&typeof x.servers==="object"?x.servers:{}};
  }catch(e){console.warn(`[${NAME}] config load failed: ${e}`);return defaultProviderConfig()}
}
function saveProviderConfig(c){world.setDynamicProperty(CONFIG_PROPERTY,JSON.stringify(c))}
function policy(c,n){
  const x=c.servers?.[n]??{}, pn=Number(x.port), pr=Number(x.priority);
  return {included:typeof x.included==="boolean"?x.included:c.defaultInclude,displayName:clean(x.displayName),host:clean(x.host),port:Number.isInteger(pn)&&pn>0&&pn<=65535?pn:0,priority:Number.isFinite(pr)?pr:0,showMaintenance:x.showMaintenance!==false};
}
function setPolicy(c,n,x){c.servers??={};c.servers[n]={...(c.servers[n]??{}),...x}}
function local(c,n){return !!c.localServer&&clean(n)===c.localServer}
function applyPolicy(destinations){
  const c=loadProviderConfig();
  return destinations.filter(d=>{
    const n=clean(d.id); const p=policy(c,n);
    return !local(c,n)&&p.included&&(!d.maintenance||p.showMaintenance);
  }).map(d=>{
    const p=policy(c,clean(d.id));
    return {...d,name:p.displayName||d.name,hostname:p.host||d.hostname,port:p.port||d.port,metadata:{...(d.metadata??{}),providerPriority:p.priority}};
  }).sort((a,b)=>policy(c,b.id).priority-policy(c,a.id).priority||String(a.name).localeCompare(String(b.name)));
}
function cfgSummary(){
  const c=loadProviderConfig(),names=discoveredServersCache.map(x=>clean(x?.name)).filter(Boolean);
  return {c,names,included:names.filter(n=>!local(c,n)&&policy(c,n).included).length};
}
function showDDUI(f){try{return f.show().catch(e=>console.warn(`[${NAME}] DDUI show failed: ${e?.message??e}`))}catch(e){console.warn(`[${NAME}] DDUI build failed: ${e?.message??e}`)}}
function defer(fn){system.run(()=>{try{fn()}catch(e){console.warn(`[${NAME}] DDUI action failed: ${e?.message??e}`)}})}
function navigate(form,fn){
 console.info(`[${NAME}] DDUI navigation click received.`);
 try{if(form?.isShowing?.())form.close()}catch(e){console.warn(`[${NAME}] DDUI close failed: ${e?.message??e}`)}
 defer(fn);
}
function adminMenu(player){
 const {c,names,included}=cfgSummary();
 const f=new CustomForm(player,"BSM PROVIDER SETTINGS").closeButton().header("Transfer UI · Bedrock Server Manager")
 .label(`Discovered: ${names.length}\nIncluded: ${included}\nThis server: ${c.localServer||"Not set"}\nNew servers: ${c.defaultInclude?"Include":"Exclude"}`).divider()
 .button("Set This Server",()=>navigate(f,()=>localMenu(player))).button("Include / Exclude Servers",()=>navigate(f,()=>includeMenu(player)))
 .button("Per-Server Overrides",()=>navigate(f,()=>overrideMenu(player)))
 .button(`New Servers: ${c.defaultInclude?"Included":"Excluded"}`,()=>navigate(f,()=>{const x=loadProviderConfig();x.defaultInclude=!x.defaultInclude;saveProviderConfig(x);lastSnapshotFingerprint="";scheduleSync("config-default-policy");adminMenu(player)}))
 .button("Apply & Republish",()=>defer(()=>{lastSnapshotFingerprint="";scheduleSync("config-apply");player.sendMessage("§aBSM provider republish queued.")}))
 .button("Reset Settings",()=>navigate(f,()=>resetMenu(player))); return showDDUI(f);
}
function localMenu(player){
 const {c,names}=cfgSummary(); const f=new CustomForm(player,"THIS SERVER").closeButton().label("Selected server is automatically excluded from transfer destinations.").divider()
 .button(`None / Not managed${!c.localServer?" §a(Current)":""}`,()=>navigate(f,()=>{const x=loadProviderConfig();x.localServer="";saveProviderConfig(x);lastSnapshotFingerprint="";scheduleSync("config-local");localMenu(player)}));
 names.forEach(n=>f.button(`${n}${c.localServer===n?" §a(Current)":""}`,()=>navigate(f,()=>{const x=loadProviderConfig();x.localServer=n;setPolicy(x,n,{included:false});saveProviderConfig(x);lastSnapshotFingerprint="";scheduleSync("config-local");localMenu(player)})));
 f.divider().button("Back",()=>navigate(f,()=>adminMenu(player))); return showDDUI(f);
}
function includeMenu(player){
 const {c,names}=cfgSummary(),v=new Map(); const f=new CustomForm(player,"INCLUDED SERVERS").closeButton().label("This Server is always excluded.").divider();
 names.forEach(n=>{const o=new ObservableBoolean(local(c,n)?false:policy(c,n).included,{clientWritable:true});v.set(n,o);f.toggle(`${n}${local(c,n)?" (This Server)":""}`,o)});
 f.divider().button("Save",()=>navigate(f,()=>{const x=loadProviderConfig();names.forEach(n=>setPolicy(x,n,{included:local(x,n)?false:!!v.get(n).getData()}));saveProviderConfig(x);lastSnapshotFingerprint="";scheduleSync("config-includes");includeMenu(player)}))
 .button("Back",()=>navigate(f,()=>adminMenu(player))); return showDDUI(f);
}
function overrideMenu(player){
 const {c,names}=cfgSummary();const f=new CustomForm(player,"SERVER OVERRIDES").closeButton().label("Override transfer-facing details without changing BSM.").divider();
 names.forEach(n=>f.button(`${n}${local(c,n)?" §e(This Server)":policy(c,n).included?" §a(Included)":" §c(Excluded)"}`,()=>navigate(f,()=>editOverride(player,n))));
 f.divider().button("Back",()=>navigate(f,()=>adminMenu(player)));return showDDUI(f);
}
function editOverride(player,n){
 const c=loadProviderConfig(),p=policy(c,n),inc=new ObservableBoolean(local(c,n)?false:p.included,{clientWritable:true}),dn=new ObservableString(p.displayName,{clientWritable:true}),host=new ObservableString(p.host,{clientWritable:true}),port=new ObservableString(p.port?String(p.port):"",{clientWritable:true}),pri=new ObservableString(String(p.priority),{clientWritable:true}),maint=new ObservableBoolean(p.showMaintenance,{clientWritable:true});
 const f=new CustomForm(player,`OVERRIDE: ${n}`).closeButton().toggle("Included",inc).textField("Display name",dn,{description:"Blank uses BSM name."}).textField("Hostname / IP",host,{description:"Blank uses provider host."}).textField("Port",port,{description:"Blank uses discovered port."}).textField("Priority",pri,{description:"Higher sorts first."}).toggle("Show while in maintenance",maint).divider()
 .button("Save",()=>navigate(f,()=>{const x=loadProviderConfig(),t=clean(port.getData()),pn=t?Number(t):0;if(t&&(!Number.isInteger(pn)||pn<1||pn>65535)){player.sendMessage("§cPort must be 1-65535 or blank.");return}setPolicy(x,n,{included:local(x,n)?false:!!inc.getData(),displayName:clean(dn.getData()),host:clean(host.getData()),port:pn,priority:Number(pri.getData())||0,showMaintenance:!!maint.getData()});saveProviderConfig(x);lastSnapshotFingerprint="";scheduleSync("config-override");overrideMenu(player)}))
 .button("Back",()=>navigate(f,()=>overrideMenu(player)));return showDDUI(f);
}
function resetMenu(player){
 const b=new MessageBox(player,"RESET SETTINGS").body("Reset local-server selection and every BSM provider override?").button1("Reset").button2("Cancel");
 b.show().then(r=>{if(r.selection===1)defer(()=>{saveProviderConfig(defaultProviderConfig());lastSnapshotFingerprint="";scheduleSync("config-reset");adminMenu(player)})}).catch(e=>console.warn(`[${NAME}] DDUI reset failed: ${e?.message??e}`));
}

function receive(id,msg){
  let p; try{p=JSON.parse(msg)}catch{metrics.malformed++;return null}
  if(!p || !Number.isInteger(p.chunk) || !Number.isInteger(p.total) || p.chunk<0 || p.total<1 || p.chunk>=p.total || typeof p.data!=="string"){metrics.malformed++;return null}
  const stream=`${id}:${p.id??"global"}`;
  let x=chunks.get(stream);
  if(!x || x.total!==p.total){x={parts:new Array(p.total),total:p.total,time:Date.now()};chunks.set(stream,x)}
  x.parts[p.chunk]=p.data;
  if(x.parts.some(v=>v===undefined))return null;
  chunks.delete(stream);
  try{return JSON.parse(x.parts.join(""))}catch{metrics.malformed++;return null}
}
function sendChunked(id,payload,requestId){
  const s=JSON.stringify(payload),total=Math.max(1,Math.ceil(s.length/CHUNK_SIZE));
  for(let i=0;i<total;i++)system.sendScriptEvent(id,JSON.stringify({__tui:1,id:requestId,chunk:i,total,data:s.slice(i*CHUNK_SIZE,(i+1)*CHUNK_SIZE)}));
}
function call(operationId,args={},retry=0,responseProjection){
  const id=`tuibsm-${Date.now()}-${++seq}`; metrics.requests++;
  return new Promise((resolve,reject)=>{
    const timeout=system.runTimeout(()=>{
      pending.delete(id); metrics.timeouts++;
      reject(Error(`BSM API IPC timeout: ${operationId} id=${id} (${REQUEST_TIMEOUT_TICKS} ticks, apiSeen=${apiSeen}, state=${apiStatus?.state??"unknown"})`));
    },REQUEST_TIMEOUT_TICKS);
    pending.set(id,{resolve,reject,timeout,operationId,created:Date.now()});
    sendChunked("bsmapi:request",{operationId,args,responseProjection},id);
  });
}
function register(){sendChunked("transferui:provider:register",{protocol:PROTOCOL,id:PROVIDER_ID,name:"Bedrock Server Manager",version:VERSION,capabilities:["destinations","destination-deltas","presence","presence-deltas","health","metadata","configure","actions"],configure:{label:"Configure BSM Provider",adminOnly:true}},`reg-${Date.now()}`)}
function registerActions(){sendChunked("transferui:actions:register",{protocol:PROTOCOL,providerId:PROVIDER_ID,actions:[{id:"refresh",label:"Refresh from BSM",scope:"destination",adminOnly:false},{id:"configure",label:"Configure BSM Provider",scope:"destination",adminOnly:true},{id:"refresh-player",label:"Refresh Player State",scope:"player",adminOnly:false}]},`actions-${Date.now()}`)}
function health(state="ready",message=""){sendChunked("transferui:provider:health",{protocol:PROTOCOL,providerId:PROVIDER_ID,state,message,time:Date.now(),metadata:{phase,hasSnapshot,bsmApiSeen:apiSeen,bsmApiState:apiStatus?.state??"unknown",bsmApiAuthenticated:apiStatus?.authenticated??false,bsmHttpReady:apiStatus?.httpReady??false,bsmHttpAuthenticated:apiStatus?.httpAuthenticated??false,bsmWebsocketState:apiStatus?.websocketState??apiStatus?.state??"unknown",ipcPending:pending.size,ipcQueue:eventQueue.length,ipcTimeouts:metrics.timeouts,bsmServers:lastSync.servers,publishedDestinations:lastSync.destinations,publishedPlayers:lastSync.players,rejectedServers:lastSync.rejected,localServer:lastSync.self,localServerManaged:!!(lastSync.self&&lastSync.managedSelf),selfServer:lastSync.self,lastSync:lastSync.time,lastSyncError:lastSync.error,lastOperation:lastSync.operation,lastHttpStatus:lastSync.httpStatus,responseStatus:lastSync.responseStatus}},`health-${Date.now()}`)}
function normalizeServerPlayers(raw,destinationId,self){
  const out=[];
  for(const item of Array.isArray(raw)?raw:[]){
    let name="",xuid="";
    if(typeof item==="string")name=clean(item);
    else if(item&&typeof item==="object"){
      name=clean(item.name??item.gamertag??item.player_name??item.username);
      xuid=clean(item.xuid??item.id??item.player_id);
      // BSM may encode a player as { "Gamertag": "XUID" }.
      if(!name&&!xuid){const e=Object.entries(item);if(e.length===1){name=clean(e[0][0]);xuid=clean(e[0][1])}}
    }
    if(!name&&!xuid)continue;
    const id=xuid||`${destinationId}:${name}`;
    out.push({id,xuid:xuid||undefined,name:name||"Unknown",destinationId,status:"online",metadata:{self:destinationId===self}});
  }
  return out;
}
async function enrichPlayerState(candidates,destinations,self){
  const byId=new Map(destinations.map(d=>[d.id,d])), players=[];
  const work=candidates.slice(); let resolved=0,failed=0;
  async function worker(){
    while(work.length){
      const c=work.shift(),d=byId.get(c.name); if(!d)continue;
      try{
        const summary=await call("get_server_summary_api_server__server_name__summary_get",{path:{server_name:c.name}});
        if(!summary||typeof summary!=="object")throw Error("summary returned no object");
        const count=Number(summary.player_count);
        const ps=normalizeServerPlayers(summary.players,c.name,self);
        if(Number.isFinite(count)&&count>=0)d.playerCount=Math.trunc(count); else if(Array.isArray(summary.players))d.playerCount=ps.length;
        d.status=clean(summary.status)||d.status;
        d.maintenance=d.status.toUpperCase()!=="RUNNING";
        d.metadata={...(d.metadata??{}),version:summary.version??d.metadata?.version??"",playerStateSource:"summary"};
        c.initial={...c.initial,...d,metadata:{...(c.initial?.metadata??{}),...(d.metadata??{})}};
        players.push(...ps); resolved++;
      }catch(e){
        const ps=normalizeServerPlayers(c.server?.players,c.name,self); players.push(...ps);
        d.playerCount=Number.isFinite(Number(c.server?.player_count))?Math.max(0,Math.trunc(Number(c.server.player_count))):ps.length;
        d.metadata={...(d.metadata??{}),playerStateSource:"server-list-fallback"};
        c.initial={...c.initial,...d,metadata:{...(c.initial?.metadata??{}),...(d.metadata??{})}};
        failed++; console.warn(`[${NAME}] player enrichment failed for ${c.name}: ${e?.message??e}; using server-list player state.`);
      }
    }
  }
  await Promise.all([worker(),worker()]);
  console.log(`[${NAME}] player enrichment complete: resolved=${resolved}, fallback=${failed}, players=${players.length}.`);
  return players;
}
function transferHost(){return clean(variables.get("transferuiBsmTransferHost")??"127.0.0.1")}
function selfServer(){return clean(variables.get("transferuiBsmSelfServer")??"")}
function requestApiStatus(){system.sendScriptEvent("bsmapi:control",JSON.stringify({action:"status"}))}
// Transfer BSM explicitly owns its live BSM subscription. The API client itself starts with no topics.
function requestApiSubscribe(){system.sendScriptEvent("bsmapi:control",JSON.stringify({action:"subscribe",consumerId:CONSUMER_ID,topic:"*"}))}
function scheduleSync(reason="unspecified"){
  if(syncing || enrichmentActive){syncQueued=true;return}
  if(syncDebounce!==null)return;
  syncDebounce=system.runTimeout(()=>{syncDebounce=null;sync(reason)},SYNC_DEBOUNCE_TICKS);
}
function shouldRefreshForBsmEvent(event){
  const raw=clean(event?.raw??event?.message??event);
  if(!raw)return false;
  const lower=raw.toLowerCase();
  // Authentication acknowledgements and transport keepalives are not data changes.
  if(lower.includes('"type":"authenticated"')||lower.includes('"action":"authenticated"')||
     lower.includes('"type":"ping"')||lower.includes('"type":"pong"')||
     lower.includes('"type":"heartbeat"')||lower.includes('"action":"ping"')||
     lower.includes('"action":"pong"')||lower.includes('"action":"heartbeat"'))return false;
  // BSM event schemas can vary by version. Only refresh for messages that look
  // capable of changing the Transfer UI server/presence snapshot.
  return /server|player|start|stop|restart|online|offline|status|state|properties|config|delete|create|update|change/.test(lower);
}
function scheduleEventRefresh(event){
  if(!shouldRefreshForBsmEvent(event))return;
  if(eventRefreshCooldown)return;
  eventRefreshCooldown=true;
  scheduleSync("bsm-event");
  system.runTimeout(()=>{eventRefreshCooldown=false},EVENT_REFRESH_COOLDOWN_TICKS);
}

async function sync(reason="unspecified"){
  if(syncing){syncQueued=true;return}
  if(!apiSeen){phase="waiting-for-bsm-api";health("connecting","Waiting for BSM API for Minecraft");requestApiStatus();return}
  if(!apiStatus?.httpReady){phase="waiting-for-bsm-http";health(hasSnapshot?"degraded":"connecting","Waiting for authenticated BSM HTTP API...");return}
  syncing=true; phase="discovering"; health(hasSnapshot?"ready":"connecting","Discovering BSM servers...");
  const operation="get_servers_list_api_servers_get";
  console.log(`[${NAME}] discovery starting: reason=${reason}, operation=${operation}, httpReady=${!!apiStatus?.httpReady}, wsState=${apiStatus?.websocketState??apiStatus?.state??"unknown"}, wsAuthenticated=${!!apiStatus?.websocketAuthenticated}.`);
  try{
    const r=await call(operation);
    console.log(`[${NAME}] discovery response received: operation=${operation}, type=${Array.isArray(r)?"array":typeof r}, keys=${r&&typeof r==="object"&&!Array.isArray(r)?Object.keys(r).join(","):"none"}.`);
    if(!r || typeof r!=="object")throw Error(`${operation}: invalid response (expected ServersListResponse object)`);
    if(r.status!==undefined && !["success","ok"].includes(clean(r.status).toLowerCase()))throw Error(`${operation}: BSM returned status=${clean(r.status)||"unknown"}${r.message?`: ${r.message}`:""}`);
    if(!Object.prototype.hasOwnProperty.call(r,"servers"))throw Error(`${operation}: response did not contain servers`);
    if(r.servers!==null && !Array.isArray(r.servers))throw Error(`${operation}: servers was not an array`);
    const servers=r.servers??[], destinations=[], candidates=[]; let rejected=0;
    discoveredServersCache=servers.slice();
    let self=loadProviderConfig().localServer||selfServer(); const host=transferHost();
    for(const s of servers){
      if(!s || typeof s!=="object"){rejected++;continue}
      const name=clean(s.name); if(!name){rejected++;continue}
      if(name===self)continue;
      let port=Number(s.port??s.server_port??s.properties?.["server-port"]??0);
      let transport=clean(s.transport??s.properties?.transport), portV6=Number(s.server_portv6??s.properties?.["server-portv6"]??0);
      let portSource=port?"server-list":"fallback";
      const cached=endpointCache.get(name);
      if(!port && cached){port=cached.port;portV6=cached.portV6;transport=cached.transport;portSource="cache"}
      if(!Number.isInteger(port)||port<1||port>65535)port=19132;
      const d={id:name,name,description:"Managed by Bedrock Server Manager",hostname:host,port,status:clean(s.status)||"Unknown",playerCount:Number(s.player_count)||0,maintenance:`${s.status??""}`.toUpperCase()!=="RUNNING",metadata:{version:s.version??"",serverManager:"bsm",portSource,endpointResolved:portSource!=="fallback",propertiesResolved:portSource==="properties"||portSource==="cache",transport:transport||"",serverPortV6:Number.isInteger(portV6)?portV6:0}};
      destinations.push(d); candidates.push({server:s,name,initial:d,needsResolve:portSource==="fallback"});
    }
    const filtered=applyPolicy(destinations);
    destinations.splice(0,destinations.length,...filtered);
    // Do not enrich excluded/local destinations. Player state comes from the per-server
    // summary endpoint so counts and presence share one authoritative snapshot.
    const allowedIds=new Set(destinations.map(d=>d.id));
    for(let i=candidates.length-1;i>=0;i--)if(!allowedIds.has(candidates[i].name))candidates.splice(i,1);
    phase="enriching-players";
    const players=await enrichPlayerState(candidates,destinations,self);
    lastSync={servers:servers.length,destinations:destinations.length,players:players.length,self,managedSelf:!!(self&&servers.some(x=>clean(x?.name)===self)),time:Date.now(),error:"",operation,httpStatus:200,responseStatus:clean(r.status),rejected};
    const fingerprint=JSON.stringify({
      destinations:destinations.map(d=>[d.id,d.hostname,d.port,d.status,d.playerCount,d.maintenance,d.metadata?.version,d.metadata?.portSource]),
      players:players.map(p=>[p.id,p.xuid,p.name,p.destinationId,p.status]),
      self
    });
    const unchanged=hasSnapshot && fingerprint===lastSnapshotFingerprint;
    lastSnapshotFingerprint=fingerprint;
    if(unchanged){
      phase="ready";
      health("ready",`BSM snapshot unchanged; retaining ${destinations.length} destination(s).`);
      console.log(`[${NAME}] discovery unchanged: BSM=${servers.length}, published=${destinations.length}; no Transfer UI transaction emitted.`);
      return;
    }
    const rev=++revision,txn=`bsm-${rev}`;
    sendChunked("transferui:provider:transaction:begin",{protocol:PROTOCOL,providerId:PROVIDER_ID,transactionId:txn},`txn-begin-${rev}`);
    sendChunked("transferui:destination:snapshot",{protocol:PROTOCOL,providerId:PROVIDER_ID,revision:rev,destinations},`dest-${rev}`);
    sendChunked("transferui:presence:snapshot",{protocol:PROTOCOL,providerId:PROVIDER_ID,revision:rev,players},`pres-${rev}`);
    sendChunked("transferui:provider:transaction:commit",{protocol:PROTOCOL,providerId:PROVIDER_ID,transactionId:txn},`txn-commit-${rev}`);
    hasSnapshot=true;
    const unresolved=candidates.filter(x=>x.needsResolve), generation=++enrichmentGeneration;
    phase=unresolved.length?"enriching-endpoints":"ready";
    health("ready",unresolved.length?`Published ${destinations.length} destination(s); resolving ${unresolved.length} endpoint(s) in background.`:`Published ${destinations.length} destination(s).`);
    console.log(`[${NAME}] initial snapshot published immediately: BSM=${servers.length}, published=${destinations.length}, unresolved=${unresolved.length}, fallback=19132.`);
    if(unresolved.length)system.run(()=>enrichEndpoints(unresolved,generation));
  }catch(e){
    const msg=`${e?.message??e}`; phase="error"; lastSync={...lastSync,time:Date.now(),error:msg,operation,httpStatus:Number(e?.status)||0};
    health(hasSnapshot?"degraded":"connecting",`Discovery failed; retaining ${lastSync.destinations} last-known destination(s). ${msg}`);
    console.warn(`[${NAME}] sync failed (${operation}): ${msg}`)
  } finally{syncing=false;if(syncQueued && !enrichmentActive){syncQueued=false;scheduleSync("queued")}}
}
async function enrichEndpoints(candidates,generation){
  enrichmentActive++; let done=0,failed=0;
  try{
    const work=candidates.slice();
    async function worker(){
      while(work.length && generation===enrichmentGeneration){
        const {server:s,name,initial}=work.shift();
        try{
          console.log(`[${NAME}] endpoint IPC -> server=${name}, operation=get_properties_api_server__server_name__properties_get_get.`);
          const pr=await call("get_properties_api_server__server_name__properties_get_get",{path:{server_name:name}},0,"properties");
          const props=pr?.properties;
          if(!props || typeof props!=="object")throw Error("properties/get returned no properties object");
          const port=Number(props["server-port"]??0), portV6=Number(props["server-portv6"]??0), transport=clean(props.transport);
          if(!Number.isInteger(port)||port<1||port>65535)throw Error(`invalid server-port: ${props["server-port"]}`);
          endpointCache.set(name,{port,portV6:Number.isInteger(portV6)?portV6:0,transport,time:Date.now()});
          if(generation!==enrichmentGeneration)return;
          let destination={...initial,hostname:transferHost(),port,metadata:{...(initial?.metadata??{}),portSource:"properties",endpointResolved:true,propertiesResolved:true,transport:transport||"",serverPortV6:Number.isInteger(portV6)?portV6:0}};
          const applied=applyPolicy([destination]); if(!applied.length)continue; destination=applied[0];
          const rev=++revision;
          sendChunked("transferui:destination:upsert",{protocol:PROTOCOL,providerId:PROVIDER_ID,revision:rev,destination},`dest-upsert-${rev}`);
          done++;
          console.log(`[${NAME}] endpoint IPC <- server=${name}, resolved=${transferHost()}:${port}, progress=${done+failed}/${candidates.length}.`);
        }catch(e){failed++;console.warn(`[${NAME}] endpoint enrichment failed for ${name}: ${e?.message??e}; retaining published fallback ${transferHost()}:19132.`)}
        phase="enriching-endpoints";
        health("ready",`Destinations live; endpoint enrichment ${done+failed}/${candidates.length} (${done} resolved, ${failed} fallback).`);
      }
    }
    await Promise.all([worker(),worker()]);
    if(generation===enrichmentGeneration){phase="ready";health("ready",`Published ${lastSync.destinations} destination(s); endpoint enrichment complete (${done} resolved, ${failed} fallback).`);console.log(`[${NAME}] endpoint enrichment complete: resolved=${done}, fallback=${failed}, total=${candidates.length}.`)}
  }finally{enrichmentActive=Math.max(0,enrichmentActive-1);if(!enrichmentActive&&syncQueued){syncQueued=false;scheduleSync("queued")}}
}
function settleResponse(r){
  if(!r?.id)return;
  metrics.responses++; const q=pending.get(r.id);
  if(!q){metrics.unmatched++;return}
  system.clearRun(q.timeout); pending.delete(r.id);
  r.ok?q.resolve(r.data):q.reject(Error(r.error||`BSM API request failed: ${q.operationId}`));
}
function handleEvent(ev){
  if(ev.id==="bsmapi:response:direct"){
    let r;try{r=JSON.parse(ev.message)}catch{metrics.malformed++;return}
    settleResponse(r);
  } else if(ev.id==="bsmapi:response"){
    const r=receive(ev.id,ev.message); if(!r)return;
    settleResponse(r);
  } else if(ev.id==="bsmapi:event"){
    const r=receive(ev.id,ev.message); if(r)scheduleEventRefresh(r);
  } else if(ev.id==="bsmapi:status"){
    const r=receive(ev.id,ev.message); if(!r)return;
    const first=!apiSeen;
    const previousState=apiStatus?.state;
    const previousHttpReady=!!apiStatus?.httpReady;
    apiSeen=true;
    apiStatus=r;
    if(!hasSnapshot)phase=r.httpReady?"bsm-http-ready":"waiting-for-bsm-http";
    if(first)console.log(`[${NAME}] BSM API detected: v${r.version??"?"}, state=${r.state??"unknown"}, httpReady=${!!r.httpReady}.`);
    if(first||previousState!==r.state||previousHttpReady!==!!r.httpReady){
      if(!first)console.log(`[${NAME}] BSM API state: ${previousState??"unknown"} -> ${r.state??"unknown"} (httpReady=${!!r.httpReady}, wsAuthenticated=${!!r.websocketAuthenticated}).`);
      requestApiSubscribe();
      // Server discovery needs authenticated HTTP only; WebSocket is optional live-update transport.
      if(r.httpReady && (!previousHttpReady || !hasSnapshot))scheduleSync("http-ready");
    }
  } else if(ev.id==="transferui:status"){
    const r=receive(ev.id,ev.message); if(r){register();registerActions();}
  }
}

system.afterEvents.scriptEventReceive.subscribe(ev=>{
  if(ev.id!=="bsmapi:response:direct"&&ev.id!=="bsmapi:response"&&ev.id!=="bsmapi:event"&&ev.id!=="bsmapi:status"&&ev.id!=="transferui:status")return;
  if(eventQueue.length>=MAX_QUEUE){metrics.dropped++;return}
  eventQueue.push({id:ev.id,message:ev.message});metrics.queued++;metrics.highWater=Math.max(metrics.highWater,eventQueue.length);
});
system.runInterval(()=>{
  let n=0;while(eventQueue.length&&n++<MAX_PER_TICK){const ev=eventQueue.shift();try{handleEvent(ev)}catch(e){console.warn(`[${NAME}] IPC handler error: ${e?.message??e}`)}metrics.processed++}
  const now=Date.now();for(const [k,x] of chunks)if(now-x.time>30000)chunks.delete(k);
},1);

system.runTimeout(()=>{
  console.log(`[${NAME}] v${VERSION} loaded: BSM -> Transfer UI Provider API v${PROTOCOL}.`);
  register();registerActions();health("connecting","Waiting for BSM API for Minecraft");requestApiSubscribe();requestApiStatus();
  system.runInterval(()=>{if(!apiSeen)requestApiStatus();else if(apiStatus?.httpReady)scheduleSync("watchdog");else requestApiStatus()},WATCHDOG_SYNC_TICKS);
  system.runInterval(()=>{const state=!apiSeen?"connecting":lastSync.error?"degraded":hasSnapshot?"ready":"connecting";const msg=!apiSeen?"Waiting for BSM API for Minecraft":!apiStatus?.httpReady?"Waiting for authenticated BSM HTTP API":lastSync.error?`Discovery failed; retaining last-known state. ${lastSync.error}`:hasSnapshot?`Discovered ${lastSync.servers} BSM server(s); published ${lastSync.destinations}.`:"Waiting for first successful BSM server snapshot";health(state,msg)},200);
},20);

// ScriptEventCommandMessageAfterEventSignal is exposed on system.afterEvents.
// Guard the subscription so an API-shape change can never prevent the provider from loading.
const tuiConfigChunks=new Map();
function decodeTransferUiEvent(message){
 let outer;try{outer=JSON.parse(message||"{}")}catch{return null}
 if(outer?.__tui!==1)return outer;
 const id=String(outer.id??"");if(!id)return null;
 let st=tuiConfigChunks.get(id);if(!st){st={total:Number(outer.total)||1,parts:[],tick:system.currentTick};tuiConfigChunks.set(id,st)}
 st.parts[Number(outer.chunk)||0]=String(outer.data??"");
 if(st.parts.filter(x=>x!==undefined).length<st.total)return null;
 tuiConfigChunks.delete(id);
 try{return JSON.parse(st.parts.join(""))}catch{return null}
}
const scriptEventSignal=system.afterEvents?.scriptEventReceive;
if(scriptEventSignal?.subscribe){
  scriptEventSignal.subscribe(ev=>{
    if(ev.id!=="transferui_bsm:admin"&&ev.id!=="transferui:provider:configure"&&ev.id!=="transferui:action:invoke")return;
    let p=ev.sourceEntity;
    if(ev.id==="transferui:action:invoke"){const msg=decodeTransferUiEvent(ev.message);if(!msg||msg.providerId!==PROVIDER_ID)return;p=world.getAllPlayers().find(x=>x.id===msg?.player?.id)||world.getAllPlayers().find(x=>x.name===msg?.player?.name);if(msg.actionId==="refresh"||msg.actionId==="refresh-player"){lastSnapshotFingerprint="";scheduleSync(`action-${msg.actionId}`);if(p)p.sendMessage("§aBSM refresh queued.");return}if(msg.actionId==="configure"){if(p)system.run(()=>adminMenu(p));return}return}
    if(ev.id==="transferui:provider:configure"){
      const msg=decodeTransferUiEvent(ev.message);if(!msg)return
      if(msg.providerId!==PROVIDER_ID)return;
      p=world.getAllPlayers().find(x=>x.id===msg?.player?.id)||world.getAllPlayers().find(x=>x.name===msg?.player?.name);
      console.info(`[${NAME}] configure request received: request=${msg.requestId??"none"}, player=${msg?.player?.name??"unknown"}, resolved=${p?.name??"none"}.`);
      if(!p){console.warn(`[${NAME}] configure request ignored: requesting player is no longer online.`);return}
    }
    if(!p||p.typeId!=="minecraft:player")return;
    system.run(()=>{try{adminMenu(p)}catch(e){console.warn(`[${NAME}] admin UI failed: ${e?.message??e}`)}});
  });
}else{
  console.warn(`[${NAME}] scriptEventReceive unavailable; provider admin command UI disabled, provider sync remains active.`);
}
