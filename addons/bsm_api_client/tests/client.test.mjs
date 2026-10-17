import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

async function client(){
  const context=vm.createContext({console,Date,Map,Set,Promise,JSON,Error,Number,Object,Array,String,encodeURIComponent});
  const requests=[], timers=[], sockets=[], intervals=[];let receive;
  let response={status:200,body:'{}'};
  const system={sendScriptEvent(){},run(fn){fn()},runInterval(fn){intervals.push(fn)},runTimeout(fn){timers.push(fn);return timers.length},clearRun(){},afterEvents:{scriptEventReceive:{subscribe(fn){receive=fn}}}};
  class HttpRequest{constructor(url){this.url=url}}
  class HttpHeader{constructor(name,value){this.name=name;this.value=value}}
  const synthetic=(exports)=>new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v] of Object.entries(exports))this.setExport(k,v)},{context});
  const modules={
    '@minecraft/server':synthetic({system}),
    '@minecraft/server-admin':synthetic({variables:{get:k=>k==='bsmApiUrl'?'http://bsm':undefined},secrets:{get:()=>({secret:true})}}),
    '@minecraft/server-net':synthetic({HttpRequest,HttpHeader,HttpRequestMethod:{Get:'GET',Post:'POST',Put:'PUT',Patch:'PATCH',Delete:'DELETE'},http:{request:async r=>{requests.push(r);return r.url.endsWith('/auth/token')?{status:200,body:'{"access_token":"jwt"}'}:response}},websocket:{connect:async()=>{const c={isOpen:true,sent:[],send(m){this.sent.push(JSON.parse(m))},close(){this.isOpen=false},afterEvents:{message:{subscribe(fn){c.message=fn}},close:{subscribe(fn){c.closed=fn}}}};sockets.push(c);return c}}})
  };
  async function load(path){if(modules[path])return modules[path];const m=new vm.SourceTextModule(await readFile(path,'utf8'),{context,identifier:path});modules[path]=m;await m.link((name,parent)=>load(name.startsWith('@')?name:fileURLToPath(new URL(name,`file://${parent.identifier}`))));return m}
  const main=await load(fileURLToPath(new URL('../raw/scripts/main.js',import.meta.url)));await main.evaluate();
  return {api:main.namespace,requests,timers,sockets,setResponse:r=>response=r,context,control:async payload=>{receive({id:"bsmapi:control",message:JSON.stringify(payload)});intervals[0]();await new Promise(resolve=>setImmediate(resolve));}};
}
test('current operation catalog and schemas are available',async()=>{
  const {api}=await client();
  for(const name of ['list_servers','get_server_summary','get_properties','get_raw_properties','get_application_metrics'])assert.ok(api.operations[name],name);
  assert.ok(Object.keys(api.operations).length>82);
});
test('documented response validation follows actual HTTP status',async()=>{
  const c=await client();
  c.api.operations.test={method:'POST',path:'/test',responses:{200:{content:{'application/json':{type:'string'}}},202:{content:{'application/json':{type:'object',required:['task_id']}}}}};
  c.setResponse({status:202,body:'{"task_id":"abc"}'});
  assert.equal((await c.api.call('test')).task_id,'abc');
  c.setResponse({status:202,body:'{}'});
  await assert.rejects(c.api.call('test'),/validation failed/);
});
test('server-list call uses current route and rejected responses retain status',async()=>{
  const c=await client();c.setResponse({status:200,body:'{"status":"success","servers":[]}'});
  await c.api.call('list_servers');assert.equal(c.requests.at(-1).url,'http://bsm/api/servers');
  c.setResponse({status:403,body:'{"detail":"Forbidden"}'});
  await assert.rejects(c.api.call('list_servers'),e=>e.status===403&&e.data.detail==='Forbidden');
});
test('server hints match exact envelope names',async()=>{
  const context=vm.createContext({Date,Number});const module=new vm.SourceTextModule(await readFile(new URL('../../transfer_ui_bsm/raw/scripts/core/reconciliation.js',import.meta.url),'utf8'),{context});await module.link(()=>{});await module.evaluate();
  assert.equal(module.namespace.eventServerHint({raw:JSON.stringify({data:{server_name:'test_2'}})},['test','test_2']),'test_2');
  assert.equal(module.namespace.eventServerHint({raw:'{"data":{"message":"test updated"}}'},['test']),'');
});

test('WebSocket requires the real backend authentication acknowledgement',async()=>{
  const c=await client();await c.control({action:'subscribe',topic:'*',consumerId:'test'});
  const socket=c.sockets[0];assert.ok(socket);assert.equal(c.api.BsmApi.status().websocketAuthenticated,false);
  socket.message({message:'{"status":"success","message":"Subscribed"}'});
  assert.equal(c.api.BsmApi.status().websocketAuthenticated,false);
  socket.message({message:'{"status":"success","message":"Authenticated successfully"}'});
  assert.equal(c.api.BsmApi.status().websocketAuthenticated,true);
  assert.ok(socket.sent.some(message=>message.action==='subscribe'&&message.topic==='*'));
  await c.control({action:'reconnect'});
  socket.closed({reason:'old connection'});
  assert.equal(c.api.BsmApi.status().state,'authenticating');
});

test('schema validation checks dictionary values, patterns and unresolved references',async()=>{
 const c=await client();
 assert.ok(c.api.validateModel('StartServerResponse',{server_name:'invalid name',outcome:'started',message:'Started'}).some(error=>error.includes('pattern')));
 c.api.models.Dictionary={type:'object',additionalProperties:{type:'string'}};
 assert.ok(c.api.validateModel('Dictionary',{port:19132}).length);
 c.api.models.Broken={$ref:'#/components/schemas/Absent'};
 assert.match(c.api.validateModel('Broken',{})[0],/unknown schema reference/);
});


test('partial outcomes remain results and unavailable failures retain their envelope', async()=>{
 const c=await client();
 c.setResponse({status:200,body:JSON.stringify({status:'partial',message:'Some logs unavailable',details:{total_entries_in_logs:1,unique_players_submitted_for_saving:1,actually_saved_or_updated_in_db:1,scan_errors:[{server:'test',error:{code:'file_error',message:'Log unavailable',details:{}}}]}})});
 const result=await c.api.call('scan_players');
 assert.equal(result.status,'partial');assert.equal(result.details.scan_errors[0].error.code,'file_error');
 c.setResponse({status:503,body:JSON.stringify({error:{code:'unavailable',message:'Storage unavailable',details:{resource:'storage'}}})});
 await assert.rejects(c.api.call('list_servers'),e=>e.status===503&&e.code==='unavailable'&&e.details.resource==='storage'&&e.message==='Storage unavailable');
});

test('committed failures warn before retrying and preserve operation results',async()=>{
 const c=await client(), result={committed:true,action:'update_account',resource:'account'};
 c.setResponse({status:500,body:JSON.stringify({error:{code:'operation_incomplete',message:'Operation incomplete',details:{result}}})});
 await assert.rejects(c.api.call('get_account'),e=>e.committed===true&&e.operationResult.resource==='account'&&e.message.includes('change was saved'));
 assert.equal(c.requests.filter(r=>r.url.endsWith('/api/account')).length,1);
});

test('unavailable population is unknown and a later successful summary restores it',async()=>{
 const context=vm.createContext({Date,Number});const m=new vm.SourceTextModule(await readFile(new URL('../../transfer_ui_bsm/raw/scripts/core/reconciliation.js',import.meta.url),'utf8'),{context});await m.link(()=>{});await m.evaluate();
 const destination={playerCount:2};
 m.namespace.reconcilePopulation(destination,{player_count:0,players_available:false},[]);
 assert.equal(destination.playerCount,null);assert.equal(destination.metadata.playersAvailable,false);
 m.namespace.reconcilePopulation(destination,{player_count:0,players_available:true},[]);
 assert.equal(destination.playerCount,0);assert.equal(destination.metadata.playersAvailable,true);
});


test('event diagnostics and graceful shutdown use current generated contracts',async()=>{
 const c=await client();
 assert.equal(c.api.operations.get_web_runtime.path,'/api/runtime');
 assert.equal(c.api.operations.list_application_events.path,'/api/events');
 c.setResponse({status:200,body:JSON.stringify({accepting:true,emitted:0,suppressed:0,failed_listeners:0,subscriptions:0,active:[],recent:[]})});
 await c.api.call('get_event_activity',{query:{owner:'plugin:example',correlation_id:'operation-1',limit:5}});
 assert.match(c.requests.at(-1).url,/owner=plugin%3Aexample/);
 c.setResponse({status:202,body:JSON.stringify({status:'accepted',instance_id:'instance',pid:123,phase:'stopping',shutdown_requested:true,shutdown_reason:'administrator'})});
 const receipt=await c.api.call('shutdown_web_runtime',{body:{}});
 assert.equal(receipt.status,'accepted');
 assert.equal(receipt.task_id,undefined);
 assert.equal(c.requests.at(-1).body,'{}');
 await assert.rejects(c.api.call('shutdown_web_runtime'),/body is required/);
});

test('diagnostic contracts validate filtered history, partial traces and comparison inputs', async()=>{
 const c=await client();
 for(const name of ['get_application_diagnostics','get_subsystem_diagnostics','get_diagnostic_history','get_diagnostic_runs','get_diagnostic_trace','get_diagnostic_report','compare_diagnostic_snapshots'])assert.ok(c.api.operations[name],name);
 assert.ok(c.api.models.CompareDiagnosticSnapshotsRequest);
 c.setResponse({status:200,body:JSON.stringify({records:[],available:false,truncated:false,next_cursor:null})});
 const history=await c.api.call('get_diagnostic_history',{query:{limit:2,outcome:'failed',cursor:'next'}});
 assert.equal(history.available,false);
 assert.match(c.requests.at(-1).url,/\/api\/diagnostics\/history\?/);
 assert.match(c.requests.at(-1).url,/cursor=next/);
 const count=c.requests.length;
 await assert.rejects(c.api.call('get_diagnostic_history',{query:{limit:0}}),/minimum/);
 await assert.rejects(c.api.call('compare_diagnostic_snapshots',{body:{before:{},after:{}}}),/invalid request model/);
 assert.equal(c.requests.length,count);
 c.setResponse({status:200,body:JSON.stringify({correlation_id:'trace',events:null,events_available:false,tasks:[],tasks_available:true,history:{records:[],available:false,truncated:false},truncated:true,issues:[]})});
 const trace=await c.api.call('get_diagnostic_trace',{path:{correlation_id:'trace'},query:{limit:2}});
 assert.equal(trace.events_available,false);
 assert.equal(trace.tasks_available,true);
 assert.equal(trace.truncated,true);
});


test('health validates process identity and preserves degraded observations', async()=>{
 const c=await client();
 for(const [instance_id,ready] of [['runtime-1',true],[null,false]]){
  const health={pid:123,instance_id,version:'4.0.0b8',ready,lifecycle:ready?'ready':'stopping',health:ready?'healthy':'degraded',checks:{lifecycle:{healthy:ready,message:'Lifecycle check'}},checked_at:1};
  c.setResponse({status:200,body:JSON.stringify(health)});
  const result=await c.api.call('get_application_health');
  assert.deepEqual(JSON.parse(JSON.stringify(result)),health);
  assert.equal(c.requests.at(-1).url,'http://bsm/api/health');
  assert.ok(c.requests.at(-1).headers.some(h=>h.name==='Authorization'&&h.value==='Bearer jwt'));
  assert.ok(!c.requests.at(-1).headers.some(h=>h.name==='X-BSM-Readiness-Token'));
  for(const field of ['pid','version']){
   const invalid={...health};delete invalid[field];
   c.setResponse({status:200,body:JSON.stringify(invalid)});
   await assert.rejects(c.api.call('get_application_health'),/validation failed/);
  }
 }
});
