import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

async function network(){
  const root=fileURLToPath(new URL('../../../',import.meta.url));
  const tasks=new Map(),receivers=[],loaders=[],events=[],observers=[],forms=[],transfers=[],requests=[],properties=new Map();let tick=0,seq=0;
  const player={id:'player-1',name:'Alex',typeId:'minecraft:player',playerPermissionLevel:0,dimension:{id:'minecraft:overworld'},hasTag:()=>false,getTags:()=>[],sendMessage(message){if(process.env.DEBUG)console.log(message)},getDynamicProperty:k=>properties.get('p:'+k),setDynamicProperty:(k,v)=>properties.set('p:'+k,v)};
  const world={getAllPlayers:()=>[player],getDynamicProperty:k=>properties.get(k),setDynamicProperty:(k,v)=>properties.set(k,v),scoreboard:{getObjective:()=>null},beforeEvents:{itemUse:{subscribe(){}}},afterEvents:{worldLoad:{subscribe(fn){loaders.push(fn)}}}};
  class Observable{constructor(value){this.value=value}getData(){return this.value}setData(value){this.value=value}}
  class Form{
    constructor(player,title){this.player=player;this.titleText=title;this.buttons=[];this.labels=[];this.showing=false;forms.push(this)}
    title(v){this.titleText=v;return this}body(){return this}label(v){this.labels.push(v);return this}header(){return this}divider(){return this}toggle(){return this}textField(){return this}dropdown(){return this}closeButton(){return this}
    button(label,fn){this.buttons.push({label,fn});return this}button1(){return this}button2(){return this}show(){this.showing=true;return Promise.resolve({canceled:true})}close(){this.showing=false}isShowing(){return this.showing}
  }
  const system={get currentTick(){return tick},sendScriptEvent:(id,message)=>events.push({id,message}),run:fn=>schedule(fn,1),runTimeout:(fn,ticks=1)=>schedule(fn,ticks),runInterval:(fn,ticks)=>schedule(fn,ticks,ticks),clearRun:id=>tasks.delete(id),afterEvents:{scriptEventReceive:{subscribe:fn=>receivers.push(fn)}}};
  function schedule(fn,ticks,interval=0){const id=++seq;tasks.set(id,{fn,at:tick+ticks,interval});return id}
  let responseHook=null;
  class HttpRequest{constructor(url){this.url=url}}class HttpHeader{constructor(name,value){Object.assign(this,{name,value})}}
  const variables={bsmApiUrl:'http://bsm',transferuiBsmTransferHost:'play.example.test'};
  const modulesByPack=[];
  async function loadPack(addon){
    const context=vm.createContext({console:process.env.DEBUG?console:{log(){},info(){},warn(){},error(){}},Date:class extends Date{static now(){return tick*50}},JSON,Map,Set,Promise,Error,Number,Object,Array,String,encodeURIComponent});
    const synthetic=exports=>new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v] of Object.entries(exports))this.setExport(k,v)},{context});
    const mods={
      '@minecraft/server':synthetic({system,world,PlayerPermissionLevel:{Operator:2}}),
      '@minecraft/server-ui':synthetic({CustomForm:Form,MessageFormData:Form,MessageBox:Form,ObservableString:Observable,ObservableBoolean:Observable,ObservableNumber:Observable}),
      '@minecraft/server-admin':synthetic({variables:{get:k=>variables[k]},secrets:{get:()=>({secret:true})},transferPlayer:(p,target)=>transfers.push({p,target})}),
      '@minecraft/server-net':synthetic({HttpRequest,HttpHeader,HttpRequestMethod:{Get:'GET',Post:'POST',Put:'PUT',Patch:'PATCH',Delete:'DELETE'},http:{request:async req=>{requests.push(req);if(responseHook){const result=await responseHook(req);if(result)return result}const path=req.url.replace('http://bsm','');let data;if(path.endsWith('/auth/token'))data={access_token:'jwt'};else if(path==='/api/servers')data={status:'success',servers:[{name:'survival',version:'test',status:'RUNNING',player_count:1}]};else if(path.endsWith('/summary'))data={name:'survival',status:'RUNNING',player_count:1,players:[],version:'test'};else if(path.endsWith('/properties/get'))data={status:'success',raw_content:'',properties:{'server-port':'19140','server-portv6':'19141'}};else data={status:'success'};return {status:200,body:JSON.stringify(data)}}},websocket:{connect:async()=>{const socket={isOpen:true,send(text){if(JSON.parse(text).action==='authenticate')schedule(()=>socket.message({message:JSON.stringify({status:'success',message:'Authenticated successfully'})}),1)},close(){this.isOpen=false},afterEvents:{message:{subscribe(fn){socket.message=fn}},close:{subscribe(){}}}};return socket}}})
    };
    async function load(path){if(mods[path])return mods[path];const mod=new vm.SourceTextModule(await readFile(path,'utf8'),{context,identifier:path});mods[path]=mod;await mod.link((name,parent)=>load(name.startsWith('@')?name:fileURLToPath(new URL(name,'file://'+parent.identifier))));return mod}
    const mod=await load(root+`addons/${addon}/raw/scripts/main.js`);await mod.evaluate();modulesByPack.push(mods);return mod;
  }
  const client=await loadPack('bsm_api_client');await loadPack('transfer_ui');await loadPack('transfer_ui_bsm');loaders.forEach(fn=>fn());
  async function step(count=1){for(let i=0;i<count;i++){tick++;const queued=events.splice(0);for(const ev of queued){receivers.forEach(fn=>fn(ev));observers.forEach(fn=>fn(ev));}for(const [id,t] of [...tasks])if(t.at<=tick){if(t.interval)t.at=tick+t.interval;else tasks.delete(id);t.fn()}await new Promise(resolve=>setImmediate(resolve));}}
  function send(id,payload){system.sendScriptEvent(id,JSON.stringify(payload))}
  function chunk(id,payload,stream='test'){const text=JSON.stringify(payload),total=Math.ceil(text.length/1400);for(let i=0;i<total;i++)send(id,{__tui:1,id:stream,chunk:i,total,data:text.slice(i*1400,(i+1)*1400)})}
  return {client,step,send,chunk,events,onEvent:fn=>observers.push(fn),forms,player,transfers,requests,properties,modulesByPack,setResponse:fn=>responseHook=fn};
}

test('packs discover servers, settle IPC and stop registration feedback',async()=>{
 const n=await network();await n.step(150);const before=n.requests.length;await n.step(100);
 assert.ok(n.requests.some(r=>r.url.endsWith('/api/servers')));
 assert.ok(n.requests.some(r=>r.url.endsWith('/properties/get')));
 assert.ok(n.events.length<20);assert.equal(n.requests.length,before);
 n.send('transferui:control',{action:'open',player:n.player.id});await n.step(5);
 assert.ok(n.forms.at(-1).buttons.some(b=>b.label.includes('survival')));
});
test('non-operators cannot open provider settings through commands or actions',async()=>{
 const n=await network();await n.step(50);const before=n.forms.length;
 n.send('transferui_bsm:admin',{});n.chunk('transferui:provider:configure',{providerId:'bsm',player:{id:n.player.id}});n.chunk('transferui:action:invoke',{providerId:'bsm',player:{id:n.player.id},actionId:'configure'});await n.step(10);
 assert.equal(n.forms.length,before);
 n.player.playerPermissionLevel=2;n.chunk('transferui:provider:configure',{providerId:'bsm',player:{id:n.player.id}},'admin');await n.step(10);assert.match(n.forms.at(-1).titleText,/BSM PROVIDER/);
});
test('endpoint enrichment survives later websocket player reconciliation',async()=>{
 const n=await network();await n.step(150);
 n.chunk('bsmapi:event',{raw:JSON.stringify({topic:'event:player_joined',data:{server_name:'survival'}})});await n.step(60);
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
test('start and join starts a stopped server and transfers after summary reports running',async()=>{
 const n=await network();let started=false;
 n.setResponse(req=>{
  if(req.url.endsWith('/api/servers'))return {status:200,body:JSON.stringify({status:'success',servers:[{name:'survival',version:'test',status:started?'RUNNING':'STOPPED'}]})};
  if(req.url.endsWith('/summary'))return {status:200,body:JSON.stringify({name:'survival',version:'test',status:started?'RUNNING':'STOPPED',players:[],player_count:0})};
  if(req.url.endsWith('/start')){started=true;return {status:200,body:JSON.stringify({status:'success',server_name:'survival',outcome:'started',message:'Started'})}};
  return null;
 });await n.step(150);n.player.playerPermissionLevel=2;n.properties.set('p:transferhub:prefs',JSON.stringify({confirmMode:'never'}));
 n.chunk('transferui:action:invoke',{providerId:'bsm',player:{id:n.player.id},actionId:'start-join',target:{id:'survival'}},'start-join');await n.step(100);assert.ok(started);assert.equal(n.transfers.at(-1)?.target.port,19140);
});
test('provider settings cannot save after operator permission is revoked',async()=>{
 const n=await network();await n.step(150);n.player.playerPermissionLevel=2;
 n.chunk('transferui:provider:configure',{providerId:'bsm',player:{id:n.player.id}},'configure');await n.step(10);const form=n.forms.at(-1);n.player.playerPermissionLevel=0;
 form.buttons.find(b=>b.label.startsWith('New Servers')).fn();await n.step(5);assert.equal(n.properties.has('transferui:bsm_provider_config_v1'),false);
});
test('main navigation exposes player preferences and live details update without reopening',async()=>{
 const n=await network();await n.step(150);n.send('transferui:control',{action:'open',player:n.player.id});await n.step(5);const menu=n.forms.at(-1);assert.ok(menu.buttons.some(b=>b.label==='Player Preferences'));
 menu.buttons.find(b=>b.label==='Open survival').fn();await n.step(5);const detail=n.forms.at(-1),label=detail.labels.find(x=>typeof x==='object'&&x.getData);assert.ok(label);await n.step(25);assert.match(label.getData(),/Updated/);assert.equal(n.forms.at(-1),detail);
});

test('HTTP waiting queue rejects overload and expires requests that cannot acquire a slot',async()=>{
 const n=await network();await n.step(150);const responses=[];
 n.setResponse(req=>req.url.endsWith('/summary')?new Promise(()=>{}):null);
 n.onEvent(ev=>{if(ev.id==='bsmapi:response:direct')responses.push(JSON.parse(ev.message))});
 for(let i=0;i<80;i++)n.chunk('bsmapi:request',{operationId:'get_server_summary',args:{path:{server_name:'survival'}}},`overload-${i}`);
 await n.step(30);assert.ok(responses.some(r=>/queue full/.test(r.error)));
 await n.step(420);assert.ok(responses.some(r=>/deadline/.test(r.error)));
});
