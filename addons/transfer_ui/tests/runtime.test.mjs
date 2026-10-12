import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

async function network(){
  const root=fileURLToPath(new URL('../../../',import.meta.url));
  const tasks=new Map(),receivers=[],loaders=[],events=[],observers=[],forms=[],transfers=[],requests=[],properties=new Map(),messages=[],logs=[],sockets=[];let tick=0,seq=0,online=true,modalHook=null,dropHook=null,writeHook=null;
  const player={id:'player-1',name:'Alex',typeId:'minecraft:player',playerPermissionLevel:0,dimension:{id:'minecraft:overworld'},hasTag:()=>false,getTags:()=>[],sendMessage(message){messages.push(message);if(process.env.DEBUG)console.log(message)},getDynamicProperty:k=>properties.get('p:'+k),setDynamicProperty:(k,v)=>properties.set('p:'+k,v)};
  const world={getAllPlayers:()=>online?[player]:[],getDynamicProperty:k=>properties.get(k),setDynamicProperty:(k,v)=>{writeHook?.(k,v);if(v===undefined)properties.delete(k);else properties.set(k,v)},scoreboard:{getObjective:()=>null},beforeEvents:{itemUse:{subscribe(){}}},afterEvents:{worldLoad:{subscribe(fn){loaders.push(fn)}}}};
  class Observable{constructor(value){this.value=value}getData(){return this.value}setData(value){this.value=value}}
  class Form{
    constructor(player,title){this.player=player;this.titleText=title;this.buttons=[];this.labels=[];this.fields=[];this.showing=false;forms.push(this)}
    title(v){this.titleText=v;return this}body(){return this}label(v){this.labels.push(v);return this}header(){return this}divider(){return this}toggle(label,value){this.fields.push({label,value});return this}textField(label,value){this.fields.push({label,value});return this}dropdown(label,value,options){this.fields.push({label,value,options});return this}closeButton(){return this}
    button(label,fn){this.buttons.push({label,fn});return this}button1(){return this}button2(){return this}show(){this.showing=true;if(this.titleText==='Confirm Transfer'&&modalHook)return modalHook(this);return Promise.resolve({canceled:true})}close(){this.showing=false}isShowing(){return this.showing}
  }
  const system={get currentTick(){return tick},sendScriptEvent:(id,message)=>events.push({id,message}),run:fn=>schedule(fn,1),runTimeout:(fn,ticks=1)=>schedule(fn,ticks),runInterval:(fn,ticks)=>schedule(fn,ticks,ticks),clearRun:id=>tasks.delete(id),afterEvents:{scriptEventReceive:{subscribe:fn=>receivers.push(fn)}}};
  function schedule(fn,ticks,interval=0){const id=++seq;tasks.set(id,{fn,at:tick+ticks,interval});return id}
  let responseHook=null;
  class HttpRequest{constructor(url){this.url=url}}class HttpHeader{constructor(name,value){Object.assign(this,{name,value})}}
  const variables={bsmApiUrl:'http://bsm',transferuiBsmTransferHost:'play.example.test'};
  const modulesByPack=[];
  async function loadPack(addon){
    const context=vm.createContext({console:process.env.DEBUG?console:{log(){},info(){},warn(message){logs.push(message)},error(message){logs.push(message)}},Date:class extends Date{static now(){return tick*50}},JSON,Map,Set,Promise,Error,Number,Object,Array,String,encodeURIComponent});
    const synthetic=exports=>new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v] of Object.entries(exports))this.setExport(k,v)},{context});
    const mods={
      '@minecraft/server':synthetic({system,world,PlayerPermissionLevel:{Operator:2}}),
      '@minecraft/server-ui':synthetic({CustomForm:Form,MessageFormData:Form,MessageBox:Form,ObservableString:Observable,ObservableBoolean:Observable,ObservableNumber:Observable}),
      '@minecraft/server-admin':synthetic({variables:{get:k=>variables[k]},secrets:{get:()=>({secret:true})},transferPlayer:(p,target)=>transfers.push({p,target})}),
      '@minecraft/server-net':synthetic({HttpRequest,HttpHeader,HttpRequestMethod:{Get:'GET',Post:'POST',Put:'PUT',Patch:'PATCH',Delete:'DELETE'},http:{request:async req=>{requests.push(req);if(responseHook){const result=await responseHook(req);if(result)return result}const path=req.url.replace('http://bsm','');let data;if(path.endsWith('/auth/token'))data={access_token:'jwt'};else if(path==='/api/servers')data={status:'success',servers:[{name:'survival',version:'test',status:'RUNNING',player_count:1}]};else if(path.endsWith('/summary'))data={name:'survival',status:'RUNNING',player_count:1,players:[],version:'test'};else if(path.endsWith('/properties/get'))data={status:'success',raw_content:'',properties:{'server-port':'19140','server-portv6':'19141'}};else data={status:'success'};return {status:200,body:JSON.stringify(data)}}},websocket:{connect:async()=>{const socket={isOpen:true,send(text){if(JSON.parse(text).action==='authenticate')schedule(()=>socket.message({message:JSON.stringify({status:'success',message:'Authenticated successfully'})}),1)},close(){this.isOpen=false},afterEvents:{message:{subscribe(fn){socket.message=fn}},close:{subscribe(){}}}};sockets.push(socket);return socket}}})
    };
    async function load(path){if(mods[path])return mods[path];const mod=new vm.SourceTextModule(await readFile(path,'utf8'),{context,identifier:path});mods[path]=mod;await mod.link((name,parent)=>load(name.startsWith('@')?name:fileURLToPath(new URL(name,'file://'+parent.identifier))));return mod}
    const mod=await load(root+`addons/${addon}/raw/scripts/main.js`);await mod.evaluate();modulesByPack.push(mods);return mod;
  }
  const client=await loadPack('bsm_api_client');await loadPack('transfer_ui');await loadPack('transfer_ui_bsm');loaders.forEach(fn=>fn());
  async function step(count=1){for(let i=0;i<count;i++){tick++;const queued=events.splice(0);for(const ev of queued){if(dropHook?.(ev))continue;receivers.forEach(fn=>fn(ev));observers.forEach(fn=>fn(ev));}for(const [id,t] of [...tasks])if(t.at<=tick){if(t.interval)t.at=tick+t.interval;else tasks.delete(id);t.fn()}await new Promise(resolve=>setImmediate(resolve));}}
  function send(id,payload){system.sendScriptEvent(id,JSON.stringify(payload))}
  function chunk(id,payload,stream='test'){const text=JSON.stringify(payload),total=Math.ceil(text.length/1400);for(let i=0;i<total;i++)send(id,{__tui:1,id:stream,chunk:i,total,data:text.slice(i*1400,(i+1)*1400)})}
  return {now:()=>tick*50,setDrop:fn=>dropHook=fn,setWrite:fn=>writeHook=fn,client,step,send,chunk,events,messages,logs,sockets,setOnline:value=>online=value,setModal:fn=>modalHook=fn,onEvent:fn=>observers.push(fn),forms,player,transfers,requests,properties,modulesByPack,setResponse:fn=>responseHook=fn};
}

test('packs discover servers, settle IPC and stop registration feedback',async()=>{
 const n=await network();await n.step(150);const before=n.requests.length;await n.step(100);
 assert.ok(n.requests.some(r=>r.url.endsWith('/api/servers')));
 assert.ok(n.requests.some(r=>r.url.endsWith('/properties/get')));
 assert.ok(n.events.length<20);assert.equal(n.requests.length,before);
 n.send('transferui:control',{action:'open',player:n.player.id});await n.step(5);
 assert.ok(n.forms.at(-1).buttons.some(b=>b.label.includes('Bedrock Server Manager')));n.forms.at(-1).buttons.find(b=>b.label.includes('Bedrock Server Manager')).fn();await n.step(5);assert.ok(n.forms.at(-1).buttons.some(b=>b.label.includes('survival')));
});
test('non-operators cannot open provider settings through commands or actions',async()=>{
 const n=await network();await n.step(50);const before=n.forms.length;
 n.send('transferui_bsm:admin',{});n.chunk('transferui:provider:configure',{providerId:'bsm',player:{id:n.player.id}});n.chunk('transferui:action:invoke',{providerId:'bsm',player:{id:n.player.id},actionId:'configure'});await n.step(10);
 assert.equal(n.forms.length,before);
 n.player.playerPermissionLevel=2;n.chunk('transferui:provider:configure',{providerId:'bsm',player:{id:n.player.id}},'admin');await n.step(10);assert.match(n.forms.at(-1).titleText,/BSM PROVIDER/);
});
test('endpoint enrichment survives later websocket player reconciliation',async()=>{
 const n=await network();await n.step(150);
 n.chunk('bsmapi:event',{raw:JSON.stringify({topic:'event:after_server_players_change',data:{server_name:'survival'}})});await n.step(60);
 n.send('transferui:control',{action:'transfer',player:n.player.id,destinationId:'provider:bsm:survival'});
 // Turn off confirmation for this player.
 n.properties.set('p:transferhub:prefs',JSON.stringify({confirmMode:'never'}));await n.step(10);
 assert.equal(n.transfers.at(-1)?.target.port,19140);
});
test('unresolved endpoints cannot transfer to fallback ports',async()=>{
 const n=await network();n.setResponse(req=>req.url.endsWith('/properties/get')?{status:500,body:'{}'}:null);await n.step(150);
 n.properties.set('p:transferhub:prefs',JSON.stringify({confirmMode:'never'}));n.send('transferui:control',{action:'transfer',player:n.player.id,destinationId:'provider:bsm:survival'});await n.step(10);assert.equal(n.transfers.length,0);
});
test('transfer dispatch enforces current destination requirements',async()=>{
 const n=await network();await n.step(30);n.properties.set('transferhub:data',JSON.stringify({nodes:[{id:'restricted',type:'server',name:'Restricted',hostname:'example.test',port:19132,requirements:{adminOnly:true}}]}));n.properties.set('p:transferhub:prefs',JSON.stringify({confirmMode:'never'}));n.send('transferui:control',{action:'transfer',player:n.player.id,destinationId:'restricted'});await n.step(10);assert.equal(n.transfers.length,0);
});
test('live contract discovery adds plugin operations and keeps catalog on invalid refresh',async()=>{
 const n=await network();n.setResponse(req=>req.url.endsWith('/openapi.json')?{status:200,body:JSON.stringify({info:{version:'test'},paths:{'/plugin':{get:{operationId:'plugin_test',responses:{200:{content:{'application/json':{schema:{type:'object'}}}}}}}},components:{schemas:{}}})}:null);
 const result=await n.client.namespace.refreshContract();assert.equal(result.source,'live');assert.ok(n.client.namespace.operations.plugin_test);
 n.setResponse(req=>req.url.endsWith('/openapi.json')?{status:200,body:'{}'}:null);await assert.rejects(n.client.namespace.refreshContract());assert.ok(n.client.namespace.operations.plugin_test);
});

test('received policy denial survives another provider timing out in allow mode',async()=>{
 const n=await network();await n.step(150);
 n.properties.set('transferhub:data',JSON.stringify({settings:{policyTimeout:'allow'},nodes:[]}));n.properties.set('p:transferhub:prefs',JSON.stringify({confirmMode:'never'}));
 for(const id of ['deny-policy','silent-policy']){n.chunk('transferui:provider:register',{protocol:1,id,capabilities:['policies']},id+'-register');n.chunk('transferui:policy:register',{providerId:id},id+'-policy')}
 await n.step(10);
 n.onEvent(ev=>{if(ev.id==='transferui:policy:request'){const frame=JSON.parse(ev.message);if(frame.total===1){const request=JSON.parse(frame.data);n.chunk('transferui:policy:response',{requestId:request.requestId,providerId:'deny-policy',result:'deny',reason:'Denied'},'denial')}}});
 n.send('transferui:control',{action:'transfer',player:n.player.id,destinationId:'provider:bsm:survival'});await n.step(40);assert.equal(n.transfers.length,0);
});
test('transfer provider ignores removed lifecycle actions and never starts a stopped server',async()=>{
 const n=await network();n.setResponse(req=>req.url.endsWith('/api/servers')?{status:200,body:JSON.stringify({status:'success',servers:[{name:'survival',version:'test',status:'STOPPED'}]})}:req.url.endsWith('/summary')?{status:200,body:JSON.stringify({name:'survival',version:'test',status:'STOPPED',players:[],player_count:0})}:null);
 await n.step(150);n.player.playerPermissionLevel=2;n.chunk('transferui:action:invoke',{providerId:'bsm',player:{id:n.player.id},actionId:'start-join',target:{id:'survival'}},'removed-action');await n.step(100);
 assert.ok(!n.requests.some(r=>r.url.endsWith('/start')));assert.equal(n.transfers.length,0);
});
test('provider settings cannot save after operator permission is revoked',async()=>{
 const n=await network();await n.step(150);n.player.playerPermissionLevel=2;
 n.chunk('transferui:provider:configure',{providerId:'bsm',player:{id:n.player.id}},'configure');await n.step(10);const form=n.forms.at(-1);n.player.playerPermissionLevel=0;
 form.buttons.find(b=>b.label.startsWith('New Servers')).fn();await n.step(5);assert.equal(n.properties.has('transferui:bsm_provider_config_v1'),false);
});
test('main navigation exposes player preferences and live details update without reopening',async()=>{
 const n=await network();await n.step(150);n.send('transferui:control',{action:'open',player:n.player.id});await n.step(5);const menu=n.forms.at(-1);assert.ok(menu.buttons.some(b=>b.label==='Player Preferences'));
 menu.buttons.find(b=>b.label.includes('Bedrock Server Manager')).fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Open survival').fn();await n.step(5);const detail=n.forms.at(-1),label=detail.labels.find(x=>typeof x==='object'&&x.getData);assert.ok(label);await n.step(25);assert.match(label.getData(),/Updated/);assert.equal(n.forms.at(-1),detail);
});

test('HTTP waiting queue rejects overload and expires requests that cannot acquire a slot',async()=>{
 const n=await network();await n.step(150);const responses=[];
 n.setResponse(req=>req.url.endsWith('/summary')?new Promise(()=>{}):null);
 n.onEvent(ev=>{if(ev.id==='bsmapi:response:direct')responses.push(JSON.parse(ev.message))});
 for(let i=0;i<80;i++)n.chunk('bsmapi:request',{operationId:'get_server_summary',args:{path:{server_name:'survival'}}},`overload-${i}`);
 await n.step(30);assert.ok(responses.some(r=>/queue full/.test(r.error)));
 await n.step(420);assert.ok(responses.some(r=>/deadline/.test(r.error)));
});

test('duplicate transfer requests share one pending confirmation and disconnect cancels it',async()=>{
 const n=await network();await n.step(150);let confirm;n.setModal(()=>new Promise(resolve=>confirm=resolve));
 n.send('transferui:control',{action:'transfer',player:n.player.id,destinationId:'provider:bsm:survival'});n.send('transferui:control',{action:'transfer',player:n.player.id,destinationId:'provider:bsm:survival'});await n.step(5);
 assert.equal(n.forms.filter(f=>f.titleText==='Confirm Transfer').length,1);assert.ok(n.messages.some(m=>m.includes('already pending')));
 n.setOnline(false);await n.step(25);confirm({canceled:false,selection:0});await n.step(5);assert.equal(n.transfers.length,0);
});
test('cancel during policy checks prevents late approval from dispatching',async()=>{
 const n=await network();await n.step(150);n.properties.set('p:transferhub:prefs',JSON.stringify({confirmMode:'never'}));
 n.chunk('transferui:provider:register',{protocol:1,id:'slow-policy',capabilities:['policies']},'slow-register');n.chunk('transferui:policy:register',{providerId:'slow-policy'},'slow-policy');await n.step(10);
 let request;n.onEvent(ev=>{if(ev.id==='transferui:policy:request'){const f=JSON.parse(ev.message);if(f.total===1)request=JSON.parse(f.data)}});
 n.send('transferui:control',{action:'transfer',player:n.player.id,destinationId:'provider:bsm:survival'});await n.step(5);
 n.forms.at(-1).buttons.find(b=>b.label==='Cancel Transfer').fn();await n.step(5);assert.ok(request);
 n.chunk('transferui:policy:response',{requestId:request.requestId,providerId:'slow-policy',result:'allow'},'late');await n.step(30);assert.equal(n.transfers.length,0);
});
test('confirmation errors are reported without undefined logging identifiers',async()=>{
 const n=await network();await n.step(150);n.setModal(()=>Promise.reject(Error('Form unavailable')));
 n.send('transferui:control',{action:'transfer',player:n.player.id,destinationId:'provider:bsm:survival'});await n.step(10);
 assert.ok(n.messages.some(m=>m.includes('Form unavailable')));assert.ok(!n.logs.some(m=>m.includes('PACK is not defined')));
});
test('stale admin forms cannot overwrite a newer draft and publish preview checks its revision',async()=>{
 const n=await network();await n.step(150);n.player.playerPermissionLevel=2;
 async function settings(){n.send('transferui:control',{action:'open',player:n.player.id});await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Admin Navigation').fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Hub Settings').fn();await n.step(5);return n.forms.at(-1)}
 const old=await settings(),current=await settings();current.fields.find(f=>f.label==='Title').value.setData('New Title');current.buttons.find(b=>b.label==='Save Draft').fn();await n.step(5);
 const saved=n.properties.get('transferhub:draft');old.fields.find(f=>f.label==='Title').value.setData('Old Title');old.buttons.find(b=>b.label==='Save Draft').fn();await n.step(5);assert.equal(n.properties.get('transferhub:draft'),saved);assert.ok(n.messages.some(m=>m.includes('Draft changed')));
 n.forms.at(-1).buttons.find(b=>b.label==='Publish Draft').fn();await n.step(5);const preview=n.forms.at(-1);assert.equal(preview.titleText,'Publish Preview');assert.ok(preview.labels.some(label=>String(label).includes('Settings: changed')));
 const changed=JSON.parse(saved);changed.draftRevision++;changed.settings.title='Another Title';n.properties.set('transferhub:draft',JSON.stringify(changed));preview.buttons.find(b=>b.label==='Publish This Draft').fn();await n.step(5);assert.notEqual(JSON.parse(n.properties.get('transferhub:data')).settings.title,'New Title');
});
test('targeted reconciliation emits player deltas and uses exact subscriptions',async()=>{
 const n=await network();await n.step(150);assert.ok(!n.client.namespace.BsmApi.status().subscriptions.includes('*'));assert.ok(n.client.namespace.BsmApi.status().subscriptions.includes('event:after_server_players_change'));
 const sent=[];n.onEvent(ev=>sent.push(ev.id));n.setResponse(req=>req.url.endsWith('/summary')?{status:200,body:JSON.stringify({name:'survival',version:'test',status:'RUNNING',player_count:1,players:[{name:'Alex',xuid:'123'}]})}:null);
 n.chunk('bsmapi:event',{raw:JSON.stringify({topic:'event:after_server_players_change',data:{server_name:'survival'}})},'join');await n.step(80);
 assert.ok(sent.includes('transferui:presence:upsert'));assert.ok(!sent.includes('transferui:presence:snapshot'));
});
test('provider becomes degraded when HTTP readiness is lost and hides connect action',async()=>{
 const n=await network();await n.step(150);n.chunk('bsmapi:status',{state:'error',httpReady:false,httpAuthenticated:false,websocketAuthenticated:false,subscriptionConsumers:{'transfer-ui-bsm':n.client.namespace.BsmApi.status().subscriptions}},'offline');await n.step(220);
 n.send('transferui:control',{action:'open',player:n.player.id});await n.step(5);n.forms.at(-1).buttons.find(b=>b.label.includes('Bedrock Server Manager')).fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Open survival').fn();await n.step(5);
 const detail=n.forms.at(-1);assert.ok(detail.labels.some(label=>typeof label==='string'&&label.startsWith('Unavailable:')));assert.ok(!detail.buttons.some(b=>b.label==='Connect'));assert.ok(detail.buttons.some(b=>b.label==='Refresh from BSM'));
});

test('move editor changes a node parent and order and publishes the reviewed draft',async()=>{
 const n=await network();await n.step(150);n.player.playerPermissionLevel=2;
 const data=JSON.parse(n.properties.get('transferhub:draft'));data.nodes.push({id:'other',type:'folder',name:'Other',parentId:null,order:0,enabled:true});data.nodes.push({id:'local',type:'server',name:'Local',parentId:'main',hostname:'example.test',port:19132,order:0,enabled:true});n.properties.set('transferhub:draft',JSON.stringify(data));
 n.send('transferui:control',{action:'open',player:n.player.id});await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Admin Navigation').fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Manage Destinations & Navigation').fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Main Servers').fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Open Children').fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Local').fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Move / Reorder').fn();await n.step(5);
 const move=n.forms.at(-1),folder=move.fields.find(f=>f.label==='Folder');folder.value.setData(folder.options.find(x=>x.label==='Other').value);move.fields.find(f=>f.label.startsWith('Sort order')).value.setData('-5');move.buttons.find(b=>b.label==='Save Move').fn();await n.step(5);
 const saved=JSON.parse(n.properties.get('transferhub:draft')).nodes.find(x=>x.id==='local');assert.equal(saved.parentId,'other');assert.equal(saved.order,-5);
 // Return from Other to draft root, then admin, then publish preview.
 n.forms.at(-1).buttons.find(b=>b.label==='Back').fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Back').fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Publish Draft').fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Publish This Draft').fn();await n.step(5);
 assert.equal(JSON.parse(n.properties.get('transferhub:data')).nodes.find(x=>x.id==='local').parentId,'other');
});
test('provider configuration rejects stale saves while retaining the newer settings',async()=>{
 const n=await network();await n.step(150);n.player.playerPermissionLevel=2;
 async function settings(id){n.chunk('transferui:provider:configure',{providerId:'bsm',player:{id:n.player.id}},id);await n.step(10);return n.forms.at(-1)}
 const old=await settings('old-config'),current=await settings('new-config');current.buttons.find(b=>b.label.startsWith('New Servers')).fn();await n.step(5);const saved=n.properties.get('transferui:bsm_provider_config_v1');old.buttons.find(b=>b.label.startsWith('New Servers')).fn();await n.step(5);assert.equal(n.properties.get('transferui:bsm_provider_config_v1'),saved);assert.ok(n.messages.some(m=>m.includes('Provider settings changed')));
});
test('API self-test loads its extracted provider helpers',async()=>{
 const n=await network();await n.step(150);n.player.playerPermissionLevel=2;n.send('transferui:control',{action:'open',player:n.player.id});await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Admin Navigation').fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='API Diagnostics & Self-Test').fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Run Self-Test').fn();await n.step(5);assert.match(n.forms.at(-1).titleText,/PASS/);
});

async function captureSnapshot(n,id){
 let result;const streams=new Map();n.onEvent(ev=>{if(ev.id!=='transferui:snapshot')return;const f=JSON.parse(ev.message),state=streams.get(f.id)??{parts:[],received:0};if(state.parts[f.chunk]===undefined){state.received++;state.parts[f.chunk]=f.data}streams.set(f.id,state);if(state.received===f.total)result=JSON.parse(state.parts.join(''))});n.send('transferui:control',{action:'snapshot',requestId:id});await n.step(30);return result;
}
test('dropped transaction part is rejected without changing presence, then retry repairs it',async()=>{
 const n=await network();await n.step(150);let name='Alice';
 n.setResponse(req=>req.url.endsWith('/summary')?{status:200,body:JSON.stringify({name:'survival',version:'test',status:'RUNNING',player_count:1,players:[{name,xuid:name}]})}:null);
 n.chunk('bsmapi:event',{raw:JSON.stringify({topic:'event:after_server_players_change',data:{server_name:'survival'}})},'alice');await n.step(80);assert.equal((await captureSnapshot(n,'before')).presence[0].name,'Alice');
 name='Bob';const acknowledgements=[];n.onEvent(ev=>{if(ev.id==='transferui:provider:transaction:result'){const f=JSON.parse(ev.message);if(f.total===1)acknowledgements.push(JSON.parse(f.data))}});
 n.setDrop(ev=>ev.id==='transferui:presence:snapshot');n.chunk('transferui:action:invoke',{providerId:'bsm',actionId:'refresh',player:{id:n.player.id}},'refresh');await n.step(80);
 assert.ok(acknowledgements.some(x=>x.ok===false));assert.equal((await captureSnapshot(n,'failed')).presence[0].name,'Alice');
 n.setDrop(null);await n.step(150);assert.equal((await captureSnapshot(n,'repaired')).presence[0].name,'Bob');assert.ok(acknowledgements.some(x=>x.ok===true));
});
test('transaction IDs reject delayed parts from a different publication',async()=>{
 const n=await network();await n.step(150);const results=[];n.onEvent(ev=>{if(ev.id==='transferui:provider:transaction:result'){const f=JSON.parse(ev.message);if(f.total===1)results.push(JSON.parse(f.data))}});
 n.chunk('transferui:provider:transaction:begin',{providerId:'bsm',transactionId:'current',parts:['presence']},'begin');n.chunk('transferui:presence:snapshot',{providerId:'bsm',transactionId:'old',revision:100,players:[{id:'late',name:'Late'}]},'late');n.chunk('transferui:provider:transaction:commit',{providerId:'bsm',transactionId:'current'},'commit');await n.step(20);assert.ok(results.some(x=>x.transactionId==='current'&&!x.ok));assert.ok(!(await captureSnapshot(n,'late-snapshot')).presence.some(x=>x.id==='late'));
});
test('expired modifying HTTP request never dispatches after a waiting slot is released',async()=>{
 const n=await network();await n.step(150);const releases=[];
 n.setResponse(req=>req.url.endsWith('/summary')?new Promise(resolve=>releases.push(resolve)):null);
 for(let i=0;i<2;i++)n.chunk('bsmapi:request',{operationId:'get_server_summary',args:{path:{server_name:'survival'}}},`blocking-${i}`);await n.step(10);
 n.chunk('bsmapi:request',{path:'/must-not-execute',method:'DELETE',deadline:0},'already-expired');
 n.chunk('bsmapi:request',{path:'/must-not-execute',method:'DELETE',deadline:10000},'expires-while-waiting');await n.step(230);
 n.setResponse(()=>null);for(const release of releases)release({status:200,body:JSON.stringify({name:'survival',version:'test',status:'RUNNING',players:[]})});await n.step(20);assert.ok(!n.requests.some(r=>r.url.endsWith('/must-not-execute')));
});
test('queued cancellation is scoped to the requesting consumer',async()=>{
 const n=await network();await n.step(150);const releases=[];n.setResponse(req=>req.url.endsWith('/summary')?new Promise(resolve=>releases.push(resolve)):null);
 for(let i=0;i<2;i++)n.chunk('bsmapi:request',{operationId:'get_server_summary',args:{path:{server_name:'survival'}}},`occupy-${i}`);await n.step(10);
 n.chunk('bsmapi:request',{path:'/cancelled',method:'DELETE',consumerId:'owner'},'cancel-me');n.send('bsmapi:control',{action:'cancel-request',consumerId:'owner',requestId:'cancel-me'});await n.step(10);
 n.chunk('bsmapi:request',{path:'/allowed',method:'POST',consumerId:'other'},'other-request');n.send('bsmapi:control',{action:'cancel-request',consumerId:'wrong-owner',requestId:'other-request'});await n.step(10);
 n.setResponse(()=>null);for(const release of releases)release({status:200,body:JSON.stringify({name:'survival',version:'test',status:'RUNNING',players:[]})});await n.step(20);assert.ok(!n.requests.some(r=>r.url.endsWith('/cancelled')));assert.ok(n.requests.some(r=>r.url.endsWith('/allowed')));
});
test('publish size preflight and storage rollback leave all snapshots unchanged on failure',async()=>{
 const n=await network();await n.step(150);n.player.playerPermissionLevel=2;
 const storage=n.modulesByPack[1][Object.keys(n.modulesByPack[1]).find(k=>k.endsWith('/core/storage.js'))].namespace;
 const original=[...n.properties];let draft=storage.getDraft();draft.draftRevision=9;draft.settings.subtitle='';draft.settings.subtitle='x'.repeat(30000-Buffer.byteLength(JSON.stringify(storage.normalize(draft))));n.properties.set('transferhub:draft',JSON.stringify(draft));
 const before=[...n.properties];assert.throws(()=>storage.publishDraft(draft,n.player,'publish',1,9),/30,000/);assert.deepEqual([...n.properties],before);
 n.properties.clear();for(const [key,value] of original)n.properties.set(key,value);draft=storage.getDraft();draft.settings.title='Changed';let failed=false;n.setWrite((key)=>{if(key==='transferhub:draft'&&!failed){failed=true;throw Error('Injected write failure')}});
 assert.throws(()=>storage.publishDraft(draft,n.player,'publish',1,0),/previous configuration restored/);assert.equal(storage.getPublished().settings.title,'§b§lServer Network');assert.equal(storage.getDraft().settings.title,'§b§lServer Network');assert.equal(n.properties.has('transferhub:backup'),false);
});
test('folder restrictions apply to search, favorites and transfer dispatch',async()=>{
 const n=await network();await n.step(150);
 n.properties.set('transferhub:data',JSON.stringify({version:4,revision:1,settings:{confirmTransfers:false},nodes:[{id:'private',type:'folder',name:'Private',parentId:null,requirements:{adminOnly:true}},{id:'child',type:'server',name:'Hidden Child',parentId:'private',hostname:'example.test',port:19132}]}));n.properties.set('p:transferhub:favorites',JSON.stringify(['child']));
 n.send('transferui:control',{action:'transfer',player:n.player.id,destinationId:'child'});await n.step(10);assert.equal(n.transfers.length,0);
 n.send('transferui:control',{action:'open',player:n.player.id});await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Favorites').fn();await n.step(5);assert.ok(!n.forms.at(-1).buttons.some(b=>b.label.includes('Hidden Child')));
 n.send('transferui:control',{action:'open',player:n.player.id});await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Search').fn();await n.step(5);n.forms.at(-1).buttons.find(b=>b.label==='Search').fn();await n.step(5);assert.ok(!n.forms.at(-1).buttons.some(b=>b.label.includes('Hidden Child')));
 n.player.playerPermissionLevel=2;n.send('transferui:control',{action:'transfer',player:n.player.id,destinationId:'child'});await n.step(10);assert.equal(n.transfers.length,1);
});

test('deadline is checked again after authentication before a modifying dispatch',async()=>{
 const n=await network();await n.step(150);let authenticate;
 n.setResponse(req=>req.url.endsWith('/auth/token')?new Promise(resolve=>authenticate=resolve):req.url.endsWith('/force-refresh')?{status:401,body:'{}'}:null);
 const refresh=n.client.namespace.BsmApi.request('/force-refresh').catch(()=>{});await n.step(5);assert.ok(authenticate);
 n.chunk('bsmapi:request',{path:'/expired-during-auth',method:'DELETE',deadline:n.now()+200},'auth-deadline');await n.step(10);
 n.setResponse(()=>null);authenticate({status:200,body:'{"access_token":"jwt"}'});await n.step(20);
 assert.ok(!n.requests.some(r=>r.url.endsWith('/expired-during-auth')));
});
test('incomplete transaction does not consume revision needed by its repaired retry',async()=>{
 const n=await network();await n.step(150);const results=[];n.onEvent(ev=>{if(ev.id==='transferui:provider:transaction:result'){const frame=JSON.parse(ev.message);if(frame.total===1)results.push(JSON.parse(frame.data))}});
 n.chunk('transferui:provider:transaction:begin',{providerId:'bsm',transactionId:'broken'},'broken-begin');n.chunk('transferui:destination:snapshot',{providerId:'bsm',transactionId:'broken',revision:100,destinations:[]},'broken-dest');n.chunk('transferui:provider:transaction:commit',{providerId:'bsm',transactionId:'broken'},'broken-commit');await n.step(15);
 n.chunk('transferui:provider:transaction:begin',{providerId:'bsm',transactionId:'fixed'},'fixed-begin');n.chunk('transferui:destination:snapshot',{providerId:'bsm',transactionId:'fixed',revision:100,destinations:[]},'fixed-dest');n.chunk('transferui:presence:snapshot',{providerId:'bsm',transactionId:'fixed',revision:100,players:[]},'fixed-pres');n.chunk('transferui:provider:transaction:commit',{providerId:'bsm',transactionId:'fixed'},'fixed-commit');await n.step(15);
 assert.ok(results.some(r=>r.transactionId==='broken'&&!r.ok));assert.ok(results.some(r=>r.transactionId==='fixed'&&r.ok));
});
