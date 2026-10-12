import { ChunkReceiver, sendJson, senderStatus } from "./core/ipc.js";
import { system } from "@minecraft/server";
import { variables, secrets } from "@minecraft/server-admin";
import { http, websocket, HttpRequest, HttpRequestMethod, HttpHeader } from "@minecraft/server-net";
import { SubscriptionRegistry } from "./core/subscription_registry.js";

const NAME="BSM API for Minecraft", VERSION="1.1.0";
import { operations, models } from "./core/contract.js";
export { operations, models };
const METHOD={GET:HttpRequestMethod.Get,POST:HttpRequestMethod.Post,PUT:HttpRequestMethod.Put,DELETE:HttpRequestMethod.Delete,PATCH:HttpRequestMethod.Patch};
const ipcReceiver=new ChunkReceiver();let emitSeq=0;
const subscriptionRegistry=new SubscriptionRegistry();
const ws={client:null,state:"disconnected",authenticated:false,lastError:"",topics:new Set(),consumers:subscriptionRegistry.consumers,retries:0,reconnect:null};
const auth={token:"",promise:null};
const contractStatus={source:"bundled",version:"4.0.0b5",lastRefresh:0,lastError:"",missing:[],added:[]};
const clean=v=>`${v??""}`.trim();
function baseUrl(){return clean(variables.get("bsmApiUrl")).replace(/\/+$/,'')}
function wsUrl(){const x=clean(variables.get("bsmApiWsUrl"));if(x)return x;const b=baseUrl();return b?b.replace(/^https:/,"wss:").replace(/^http:/,"ws:")+"/ws":""}
function username(){return secrets.get("bsmApiUsername")}
function password(){return secrets.get("bsmApiPassword")}
function emit(id,obj){sendJson(system,id,obj,`${obj?.id??id}:${Date.now()}:${++emitSeq}`)}

function emitIpcResponse(obj){
  const s=JSON.stringify(obj);
  // Most IPC replies, especially projected properties, fit safely in one ScriptEvent.
  // Sending them directly avoids correlation/reassembly races between independent packs.
  if(s.length<=1400)system.sendScriptEvent("bsmapi:response:direct",s);
  else emit("bsmapi:response",obj);
}
function status(){
  const httpAuthenticated=!!auth.token;
  emit("bsmapi:status",{
    version:VERSION,
    state:ws.state,
    authenticated:ws.authenticated,
    httpReady:httpAuthenticated,
    httpAuthenticated,
    websocketState:ws.state,
    websocketAuthenticated:ws.authenticated,
    ready:httpAuthenticated,
    lastError:ws.lastError,
    baseUrl:baseUrl(),wsUrl:wsUrl(),subscriptions:[...ws.topics],subscriptionConsumers:Object.fromEntries([...ws.consumers].map(([id,set])=>[id,[...set]])),operationCount:Object.keys(operations).length,modelCount:Object.keys(models).length,contract:{...contractStatus},ipc:{...ipcMetrics,active:ipcHttpActive,waiting:ipcHttpWaiters.length,outgoing:senderStatus(system)}
  });
}
async function authenticate(force=false){if(auth.token&&!force)return auth.token;if(auth.promise)return auth.promise;const b=baseUrl(),u=username(),p=password();if(!b)throw Error("Set bsmApiUrl in variables.json");if(!u||!p)throw Error("Set bsmApiUsername and bsmApiPassword in secrets.json");auth.promise=(async()=>{const attempts=[{path:"/minecraft-bsm-api/auth/token",uh:"X-BSM-API-Username",ph:"X-BSM-API-Password",name:"BSM API bridge"},{path:"/transfer-ui/auth/token",uh:"X-TransferUI-Username",ph:"X-TransferUI-Password",name:"legacy Transfer UI bridge"}];let last=null;for(const a of attempts){const r=new HttpRequest(`${b}${a.path}`);r.method=HttpRequestMethod.Post;r.timeout=10;r.headers=[new HttpHeader("Accept","application/json"),new HttpHeader(a.uh,u),new HttpHeader(a.ph,p)];const res=await http.request(r);if(res.status===404){last=res;continue}if(res.status<200||res.status>=300)throw Error(`${a.name} auth HTTP ${res.status}: ${res.body?.slice?.(0,200)??""}`);const d=JSON.parse(res.body||"{}");if(!d.access_token)throw Error(`${a.name} returned no access_token`);auth.token=d.access_token;auth.bridge=a.path;status();return auth.token}const detail=last?.body?.slice?.(0,200)??"";throw Error(`Authentication bridge not found (HTTP 404). Install and enable bsm_addon_api_bridge.py in BSM, then restart the BSM web server.${detail?` BSM response: ${detail}`:""}`)})().finally(()=>auth.promise=null);return auth.promise}
function encodeQuery(q={}){const a=[];for(const [k,v] of Object.entries(q)){if(v===undefined||v===null)continue;if(Array.isArray(v))for(const x of v)a.push(`${encodeURIComponent(k)}=${encodeURIComponent(x)}`);else a.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`)}return a.length?"?"+a.join("&"):""}
async function rawRequest(path,method="GET",body,query,headers={},retry=true,contentType="application/json",detailed=false){const token=await authenticate();const r=new HttpRequest(`${baseUrl()}${path}${encodeQuery(query)}`);r.method=METHOD[`${method}`.toUpperCase()];if(r.method===undefined)throw Error(`Unsupported HTTP method: ${method}`);r.timeout=15;const hs=[new HttpHeader("Accept","application/json"),new HttpHeader("Authorization",`Bearer ${token}`)];for(const [k,v] of Object.entries(headers||{}))hs.push(new HttpHeader(k,`${v}`));if(body!==undefined){if(contentType.includes("x-www-form-urlencoded")&&body&&typeof body==="object")r.body=Object.entries(body).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");else r.body=typeof body==="string"?body:JSON.stringify(body);hs.push(new HttpHeader("Content-Type",contentType))}r.headers=hs;const res=await http.request(r);if(res.status===401&&retry){auth.token="";await authenticate(true);return rawRequest(path,method,body,query,headers,false,contentType,detailed)}let data=res.body;try{data=JSON.parse(res.body||"null")}catch{}if(res.status<200||res.status>=300){const e=Error(`BSM HTTP ${res.status}`);e.status=res.status;e.data=data;throw e}return detailed?{status:res.status,data}:data}
function buildPath(t,params={}){return t.replace(/\{([^}]+)\}/g,(_,k)=>{if(params[k]===undefined)throw Error(`Missing path parameter: ${k}`);return encodeURIComponent(params[k])})}
function refName(ref){return `${ref||""}`.split("/").pop()}
function deref(schema){if(schema?.$ref)return models[refName(schema.$ref)]??null;return schema??{}}
function typeOk(v,t){if(t==="null")return v===null;if(t==="array")return Array.isArray(v);if(t==="object")return v!==null&&typeof v==="object"&&!Array.isArray(v);if(t==="integer")return typeof v==="number"&&Number.isInteger(v);if(t==="number")return typeof v==="number"&&Number.isFinite(v);if(t==="boolean")return typeof v==="boolean";if(t==="string")return typeof v==="string";return true}
function validateSchema(value,schema,path="$",errors=[],depth=0){if(depth>64){errors.push(`${path}: schema nesting limit exceeded`);return errors}if(!schema)return errors;if(schema.$ref){const resolved=deref(schema);if(!resolved){errors.push(`${path}: unknown schema reference ${schema.$ref}`);return errors}return validateSchema(value,resolved,path,errors,depth+1)}if(schema.anyOf){const ok=schema.anyOf.some(x=>validateSchema(value,x,path,[],depth+1).length===0);if(!ok)errors.push(`${path}: does not match anyOf`);return errors}if(schema.oneOf){const n=schema.oneOf.filter(x=>validateSchema(value,x,path,[],depth+1).length===0).length;if(n!==1)errors.push(`${path}: must match exactly one oneOf schema`);return errors}if(schema.allOf){for(const x of schema.allOf)validateSchema(value,x,path,errors,depth+1)}if(schema.enum&&!schema.enum.some(x=>x===value))errors.push(`${path}: must be one of ${schema.enum.join(", ")}`);if(schema.const!==undefined&&value!==schema.const)errors.push(`${path}: must equal ${schema.const}`);let types=schema.type;if(types&&!Array.isArray(types))types=[types];if(types&&!types.some(t=>typeOk(value,t))){errors.push(`${path}: expected ${types.join("|")}`);return errors}if(value===null||value===undefined)return errors;if(typeof value==="number"){for(const [key,invalid] of [["minimum",value<schema.minimum],["maximum",value>schema.maximum],["exclusiveMinimum",value<=schema.exclusiveMinimum],["exclusiveMaximum",value>=schema.exclusiveMaximum]])if(schema[key]!==undefined&&invalid)errors.push(`${path}: violates ${key}`)}if(typeof value==="string"){if(schema.minLength!==undefined&&value.length<schema.minLength)errors.push(`${path}: too short`);if(schema.maxLength!==undefined&&value.length>schema.maxLength)errors.push(`${path}: too long`);if(schema.pattern&&!new RegExp(schema.pattern).test(value))errors.push(`${path}: does not match pattern`)}if(Array.isArray(value)){if(schema.minItems!==undefined&&value.length<schema.minItems)errors.push(`${path}: too few items`);if(schema.maxItems!==undefined&&value.length>schema.maxItems)errors.push(`${path}: too many items`)}if(schema.additionalProperties===false&&value&&typeof value==="object"&&!Array.isArray(value))for(const key of Object.keys(value))if(!Object.prototype.hasOwnProperty.call(schema.properties??{},key))errors.push(`${path}.${key}: unknown property`);if((types?.includes("object")||schema.properties)&&typeof value==="object"&&!Array.isArray(value)){for(const k of schema.required||[])if(value[k]===undefined)errors.push(`${path}.${k}: required`);for(const [k,sub] of Object.entries(schema.properties||{}))if(value[k]!==undefined)validateSchema(value[k],sub,`${path}.${k}`,errors,depth+1)}if(schema.additionalProperties&&typeof schema.additionalProperties==="object"&&value&&typeof value==="object"&&!Array.isArray(value))for(const [key,item] of Object.entries(value))if(!Object.prototype.hasOwnProperty.call(schema.properties??{},key))validateSchema(item,schema.additionalProperties,`${path}.${key}`,errors,depth+1);if((types?.includes("array")||schema.items)&&Array.isArray(value))for(let i=0;i<value.length;i++)validateSchema(value[i],schema.items,`${path}[${i}]`,errors,depth+1);return errors}
export function validateModel(name,value){const schema=models[name];if(!schema)throw Error(`Unknown BSM model: ${name}`);return validateSchema(value,schema)}
export function createModel(name,value={}){const errors=validateModel(name,value);if(errors.length)throw Error(`Invalid ${name}: ${errors.join("; ")}`);return value}
function selectRequest(op,args){const content=op.request?.content||{};const contentType=args.contentType||Object.keys(content)[0]||"application/json";return {contentType,schema:content[contentType]||{}}}
function responseSchema(op,status,contentType="application/json"){const r=op.responses?.[`${status}`]??op.responses?.default;if(!r)return null;const c=r.content||{};return c[contentType]??c[Object.keys(c)[0]]??null}
export async function call(operationId,args={}){const op=operations[operationId];if(!op)throw Error(`Unknown BSM operationId: ${operationId}`);const pathParams={...(args.path||{})},query={...(args.query||{})},headers={...(args.headers||{})};for(const p of op.parameters||[]){const v=args[p.name]!==undefined?args[p.name]:(p.in==="path"?pathParams[p.name]:p.in==="header"?headers[p.name]:query[p.name]);if(p.required&&v===undefined)throw Error(`${operationId}: missing required ${p.in} parameter ${p.name}`);if(v!==undefined){const pe=validateSchema(v,p.schema,`${p.in}.${p.name}`,[]);if(pe.length)throw Error(`${operationId}: ${pe.join("; ")}`);if(p.in==="path")pathParams[p.name]=v;else if(p.in==="query")query[p.name]=v;else if(p.in==="header")headers[p.name]=v}}
 const req=selectRequest(op,args);if(args.body!==undefined&&req.schema){const errors=validateSchema(args.body,req.schema,"body",[]);if(errors.length)throw Error(`${operationId}: invalid request model: ${errors.join("; ")}`)}else if(op.request?.required)throw Error(`${operationId}: request body is required`);
 const response=await rawRequest(buildPath(op.path,pathParams),op.method,args.body,query,headers,undefined,req.contentType,true);const data=response.data;if(args.validateResponse!==false){const rs=responseSchema(op,response.status);if(rs){const errors=validateSchema(data,rs,"response",[]);if(errors.length){const e=Error(`${operationId}: response model validation failed: ${errors.join("; ")}`);e.modelErrors=errors;throw e}}}return data}
export const BsmApi={operations,models,call,refreshContract,contractStatus,request:rawRequest,validateModel,createModel,status:()=>({state:ws.state,authenticated:ws.authenticated,httpReady:!!auth.token,httpAuthenticated:!!auth.token,websocketState:ws.state,websocketAuthenticated:ws.authenticated,ready:!!auth.token,lastError:ws.lastError,baseUrl:baseUrl(),wsUrl:wsUrl(),subscriptions:[...ws.topics],subscriptionConsumers:Object.fromEntries([...ws.consumers].map(([id,set])=>[id,[...set]])),operationCount:Object.keys(operations).length,modelCount:Object.keys(models).length,contract:{...contractStatus},ipc:{...ipcMetrics,active:ipcHttpActive,waiting:ipcHttpWaiters.length,outgoing:senderStatus(system)}})};
function wsSend(o){try{if(ws.client?.isOpen){ws.client.send(JSON.stringify(o));return true}}catch(e){ws.lastError=`${e}`}return false}
function rebuildTopics(){const next=subscriptionRegistry.topics();const old=ws.topics;ws.topics=next;if(ws.authenticated){for(const t of old)if(!next.has(t))wsSend({action:"unsubscribe",topic:t});for(const t of next)if(!old.has(t))wsSend({action:"subscribe",topic:t})}if(!next.size){if(ws.reconnect!==null){system.clearRun(ws.reconnect);ws.reconnect=null}const previous=ws.client;ws.client=null;try{previous?.close()}catch{}ws.state="disconnected";ws.authenticated=false}else if(!ws.authenticated&&!ws.client?.isOpen)connectWs().catch(()=>{});status()}
function subscribe(topic,consumerId="anonymous"){topic=`${topic??""}`.trim();consumerId=`${consumerId??"anonymous"}`.trim()||"anonymous";if(!topic)return false;const added=subscriptionRegistry.subscribe(consumerId,topic);rebuildTopics();return added}
function unsubscribe(topic,consumerId="anonymous"){topic=`${topic??""}`.trim();consumerId=`${consumerId??"anonymous"}`.trim()||"anonymous";const existed=subscriptionRegistry.unsubscribe(consumerId,topic);rebuildTopics();return existed}
function unsubscribeConsumer(consumerId){consumerId=`${consumerId??""}`.trim();if(!consumerId)return false;const existed=subscriptionRegistry.removeConsumer(consumerId);if(existed)rebuildTopics();return existed}
function reconnectLater(){if(!ws.topics.size||ws.reconnect!==null)return;const d=[20,40,100,200,600][Math.min(ws.retries++,4)];ws.reconnect=system.runTimeout(()=>{ws.reconnect=null;connectWs().catch(()=>{})},d)}
let connectionPromise=null;
async function connectWs(force=false){
  if(connectionPromise)return connectionPromise;
  connectionPromise=(async()=>{
    try{
      if(!ws.topics.size)return false;
      if(ws.client?.isOpen&&!force)return true;
      const previous=ws.client;ws.client=null;try{previous?.close()}catch{}
      const token=await authenticate(force),url=wsUrl();
      if(!url)throw Error("BSM WebSocket URL unavailable");
      ws.state="connecting";ws.authenticated=false;status();
      const c=await websocket.connect(url);
      if(!ws.topics.size){c.close();return false}
      ws.client=c;
      c.afterEvents.message.subscribe(ev=>{
        if(ws.client!==c)return;
        try{
          const x=JSON.parse(ev.message);
          if(ws.state==="authenticating"&&x.status==="success"&&x.message==="Authenticated successfully"){
            ws.authenticated=true;ws.state="live";ws.retries=0;ws.lastError="";
            for(const t of ws.topics)wsSend({action:"subscribe",topic:t});status();
          }
        }catch{}
        emit("bsmapi:event",{raw:ev.message});
      });
      c.afterEvents.close.subscribe(ev=>{
        if(ws.client!==c)return;
        ws.client=null;ws.state="disconnected";ws.authenticated=false;
        ws.lastError=`BSM closed WebSocket${ev?.reason!==undefined?` (reason ${ev.reason})`:""}`;
        status();reconnectLater();
      });
      ws.state="authenticating";status();c.send(JSON.stringify({action:"authenticate",token}));
      system.runTimeout(()=>{
        if(ws.client!==c||ws.authenticated)return;
        ws.client=null;try{c.close()}catch{}
        auth.token="";ws.state="error";ws.lastError="WebSocket authentication timed out";status();reconnectLater();
      },200);
      return true;
    }catch(e){ws.state="error";ws.authenticated=false;ws.lastError=`${e?.message??e}`;status();reconnectLater();return false}
  })().finally(()=>connectionPromise=null);
  return connectionPromise;
}
function disconnectWs(){if(ws.reconnect!==null){system.clearRun(ws.reconnect);ws.reconnect=null}const previous=ws.client;ws.client=null;try{previous?.close()}catch{}ws.state="disconnected";ws.authenticated=false;status()}
function receiveChunk(ev){let id;try{id=JSON.parse(ev.message)?.id;const payload=ipcReceiver.receive(ev.id,ev.message);return payload?{id,payload}:null}catch(e){return id?{id,error:e.message}:null}}

// Keep ScriptEvent callbacks tiny. HTTP/OpenAPI work is dispatched from the tick queue so
// Bedrock cannot interrupt a long async request while we are inside scriptEventReceive.
const ipcQueue=[];
const IPC_QUEUE_MAX=1024, IPC_PER_TICK=8;
const ipcMetrics={queued:0,processed:0,dropped:0,errors:0,highWater:0,requests:0,responses:0};
const IPC_HTTP_CONCURRENCY=2, IPC_HTTP_WAIT_MAX=64; let ipcHttpActive=0; const ipcHttpWaiters=[];
function acquireIpcHttp(){return new Promise((resolve,reject)=>{if(ipcHttpWaiters.length>=IPC_HTTP_WAIT_MAX){reject(Error("BSM request queue full"));return}if(ipcHttpActive<IPC_HTTP_CONCURRENCY){ipcHttpActive++;resolve()}else {const waiter={resolve,reject,timer:system.runTimeout(()=>{const i=ipcHttpWaiters.indexOf(waiter);if(i>=0)ipcHttpWaiters.splice(i,1);reject(Error("BSM request queue deadline exceeded"))},400)};ipcHttpWaiters.push(waiter)}})}
function releaseIpcHttp(){const next=ipcHttpWaiters.shift();if(next){system.clearRun(next.timer);next.resolve();}else ipcHttpActive=Math.max(0,ipcHttpActive-1)}
export async function refreshContract(){
  try{
    const schema=await rawRequest("/openapi.json"),next={};
    if(!schema?.paths||!schema.components?.schemas)throw Error("Invalid OpenAPI document");
    for(const [path,item] of Object.entries(schema.paths))for(const [method,operation] of Object.entries(item)){
      if(!["get","post","put","patch","delete"].includes(method))continue;
      const id=operation.operationId;if(!id||next[id])throw Error("Missing or duplicate operationId");
      const content=value=>Object.fromEntries(Object.entries(value?.content??{}).map(([media,x])=>[media,x.schema??{}]));
      next[id]={method:method.toUpperCase(),path,summary:operation.summary??"",tags:operation.tags??[],parameters:[...(item.parameters??[]),...(operation.parameters??[])],request:{required:!!operation.requestBody?.required,content:content(operation.requestBody)},responses:Object.fromEntries(Object.entries(operation.responses??{}).map(([code,response])=>[code,{content:content(response)}]))};
    }
    if(!Object.keys(next).length)throw Error("OpenAPI contains no operations");
    contractStatus.missing=Object.keys(operations).filter(id=>!next[id]);contractStatus.added=Object.keys(next).filter(id=>!operations[id]);
    for(const id of Object.keys(operations))delete operations[id];Object.assign(operations,next);
    for(const id of Object.keys(models))delete models[id];Object.assign(models,schema.components.schemas);
    Object.assign(contractStatus,{source:"live",version:schema.info?.version??"",lastRefresh:Date.now(),lastError:""});status();return {...contractStatus};
  }catch(e){contractStatus.lastError=e.message;status();throw e}
}
async function handleIpc(ev){
  if(ev.id==="bsmapi:request"){
    const got=receiveChunk(ev); if(!got)return;
    const {id,payload,error}=got;
    if(error){ipcMetrics.responses++;emitIpcResponse({id,ok:false,error});return}
    ipcMetrics.requests++;
    let slot=false;
    try{
      await acquireIpcHttp(); slot=true;
      const started=Date.now();
      console.log(`[${NAME}] IPC -> id=${id} op=${payload.operationId??"raw"} active=${ipcHttpActive}/${IPC_HTTP_CONCURRENCY}`);
      let data;
      if(payload.operationId==="refresh_contract")data=await refreshContract();
      else if(payload.operationId)data=await call(payload.operationId,payload.args||{});
      else data=await rawRequest(payload.path,payload.method,payload.body,payload.query,payload.headers,undefined,payload.contentType);
      console.log(`[${NAME}] IPC <- id=${id} op=${payload.operationId??"raw"} ok=true ms=${Date.now()-started}`);
      // IPC projection is transport-only: the public API client still returns the complete
      // OpenAPI response. Callers may request a smaller response over ScriptEvent IPC so
      // large fields such as server.properties raw_content do not flood the event bus.
      if(payload.responseProjection==="properties" && data && typeof data==="object") {
        data={status:data.status,message:data.message??null,properties:data.properties??{}};
      }
      ipcMetrics.responses++;emitIpcResponse({id,ok:true,data});
    }catch(e){
      console.warn(`[${NAME}] IPC <- id=${id} op=${payload.operationId??"raw"} ok=false error=${e?.message??e}`);
      ipcMetrics.responses++;emitIpcResponse({id,ok:false,error:`${e?.message??e}`,status:e?.status,data:e?.data});
    }finally{if(slot)releaseIpcHttp()}
  }else if(ev.id==="bsmapi:control"){
    let p;try{p=JSON.parse(ev.message)}catch{return}
    if(p.action==="reconnect")connectWs(true);
    else if(p.action==="disconnect")disconnectWs();
    else if(p.action==="subscribe")subscribe(p.topic,p.consumerId);
    else if(p.action==="unsubscribe")unsubscribe(p.topic,p.consumerId);
    else if(p.action==="unsubscribe-consumer")unsubscribeConsumer(p.consumerId);
    else if(p.action==="status")status();
    else if(p.action==="refresh-contract")refreshContract().catch(e=>console.warn(`[${NAME}] contract refresh failed: ${e.message}`));
    else if(p.action==="operations")emit("bsmapi:operations",{operations});
  }
}
system.afterEvents.scriptEventReceive.subscribe(ev=>{
  if(ev.id!=="bsmapi:request"&&ev.id!=="bsmapi:control")return;
  if(ipcQueue.length>=IPC_QUEUE_MAX){ipcMetrics.dropped++;if(ev.id==="bsmapi:request"){try{const frame=JSON.parse(ev.message);if(frame.id&&frame.chunk===0)emitIpcResponse({id:frame.id,ok:false,error:"BSM IPC queue full",status:429})}catch{}}return}
  ipcQueue.push({id:ev.id,message:ev.message});ipcMetrics.queued++;ipcMetrics.highWater=Math.max(ipcMetrics.highWater,ipcQueue.length);
});
system.runInterval(()=>{
  let n=0;
  while(ipcQueue.length&&n++<IPC_PER_TICK){
    const ev=ipcQueue.shift();
    system.run(()=>handleIpc(ev).catch(e=>{ipcMetrics.errors++;console.warn(`[${NAME}] IPC handler error: ${e?.message??e}`)}));
    ipcMetrics.processed++;
  }
  ipcReceiver.expire();
},1);
system.runTimeout(()=>{
  console.log(`[${NAME}] v${VERSION} loaded with ${Object.keys(operations).length} OpenAPI operations and ${Object.keys(models).length} models.`);
  status();
  if(variables.get("bsmApiDiscoverContract")===true)refreshContract().catch(()=>{});
  // WebSocket ownership is consumer-driven. Consumers explicitly subscribe through bsmapi:control.
  // The API client does not open a WebSocket until at least one topic has been requested.
  system.runInterval(()=>{if(ws.topics.size&&!ws.client?.isOpen)connectWs().catch(()=>{})},1200);
},20);
