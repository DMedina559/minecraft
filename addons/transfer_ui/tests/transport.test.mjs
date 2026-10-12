import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
async function moduleAt(relative,globals={}){const module=new vm.SourceTextModule(await readFile(new URL(relative,import.meta.url),'utf8'),{context:vm.createContext({Date,JSON,Number,Map,Set,Object,Array,Error,...globals})});await module.link(()=>{});await module.evaluate();return module.namespace}
for(const addon of ['transfer_ui','transfer_ui_bsm','bsm_api_client'])test(`${addon} chunk transport handles order, missing pieces and conflicting duplicates`,async()=>{
 const {ChunkReceiver,sendJson}=await moduleAt(`../../${addon}/raw/scripts/core/ipc.js`),receiver=new ChunkReceiver(),frames=[];
 sendJson({sendScriptEvent:(channel,message)=>frames.push({channel,message})},'test',{text:'x'.repeat(5000)},'stream');
 assert.equal(receiver.receive('test',frames[2].message),null);assert.equal(receiver.receive('test',frames[0].message),null);assert.equal(receiver.receive('test',frames[0].message),null);assert.equal(receiver.receive('test',frames[3].message),null);assert.equal(receiver.receive('test',frames[1].message).text.length,5000);
 receiver.receive('test',frames[0].message);const bad=JSON.parse(frames[0].message);bad.data='different';assert.throws(()=>receiver.receive('test',JSON.stringify(bad)),/Conflicting/);
 assert.throws(()=>receiver.receive('test',JSON.stringify({id:'bad',chunk:0,total:999999,data:''})),/Invalid/);
});
test('chunk transport bounds streams and expires abandoned messages',async()=>{
 let now=0;const {ChunkReceiver}=await moduleAt('../raw/scripts/core/ipc.js',{Date:class{static now(){return now}}});const receiver=new ChunkReceiver({maxStreams:1,ttlMs:10});
 const frame=id=>JSON.stringify({id,chunk:0,total:2,data:'{'});assert.equal(receiver.receive('test',frame('one')),null);assert.throws(()=>receiver.receive('test',frame('two')),/Too many/);now=11;assert.equal(receiver.expire(),1);assert.equal(receiver.receive('test',frame('two')),null);
});
test('endpoint configuration selects IPv6, overrides and explicit NetherNet IDs',async()=>{
 const {resolveEndpoint}=await moduleAt('../../transfer_ui_bsm/raw/scripts/core/endpoints.js');const base={hostname:'public.example',port:19132,metadata:{endpointResolved:true,serverPortV6:19133}};
 assert.equal(resolveEndpoint(base,{addressFamily:'ipv6'}).port,19133);assert.equal(resolveEndpoint(base,{port:20000,priority:5}).order,-5);
 assert.equal(resolveEndpoint({...base,metadata:{transport:'nethernet'}}).metadata.endpointResolved,false);
 const net=resolveEndpoint(base,{transport:'nethernet',netherNetId:'123'});assert.equal(net.transferType,'nethernet');assert.equal(net.metadata.endpointResolved,true);
 assert.equal(resolveEndpoint({...base,metadata:{endpointResolved:false}}).metadata.endpointResolved,false);
});
test('catalog filtering and pagination retain every matching destination',async()=>{
 const {pageRows,filterDestinations}=await moduleAt('../raw/scripts/ui/catalog.js');const rows=Array.from({length:61},(_,i)=>({name:`Server ${i}`,region:i%2?'US':'EU',gameMode:'survival',providerMeta:{players:i,maxPlayers:50}}));
 assert.equal(pageRows(rows,3).rows.length,1);assert.equal(pageRows(rows,99).page,3);assert.equal(filterDestinations(rows,{capacity:true,region:'US'}).length,25);assert.equal(filterDestinations(rows,{query:'Server',sort:'players'})[0].providerMeta.players,0);
});

test('configuration rejects duplicates, cycles, invalid ports and malformed requirements',async()=>{
 const {validateConfiguration}=await moduleAt('../raw/scripts/core/configuration.js');
 const folder={id:'folder',name:'Folder',type:'folder',parentId:null};
 assert.equal(validateConfiguration({nodes:[folder]}).length,0);
 assert.ok(validateConfiguration({nodes:[folder,folder]}).some(e=>e.includes('Duplicate')));
 assert.ok(validateConfiguration({nodes:[{...folder,parentId:'folder'}]}).some(e=>e.includes('cycle')));
 assert.ok(validateConfiguration({nodes:[{id:'server',name:'Server',type:'server',hostname:'example.test',port:70000,requirements:{minScore:5,maxScore:1}}]}).length>=2);
 assert.ok(validateConfiguration({nodes:[{...folder,parentId:'missing'}]}).some(e=>e.includes('parent')));
});
test('outgoing transport paces frames, preserves order and bounds wire size for escaped Unicode',async()=>{
 const {JsonSender,ChunkReceiver,wireBytes}=await moduleAt('../raw/scripts/core/ipc.js');const frames=[],timers=new Map();let seq=0;
 const system={sendScriptEvent:(channel,message)=>frames.push({channel,message}),runInterval:fn=>{timers.set(++seq,fn);return seq},clearRun:id=>timers.delete(id)};
 const sender=new JsonSender(system,{perTick:2,maxFrames:30}),text='"\\😀漢'.repeat(1000);sender.send('test',{text},'unicode');sender.send('test',{after:true},'after');
 assert.equal(frames.length,0);[...timers.values()].forEach(fn=>fn());assert.equal(frames.length,2);while(timers.size)[...timers.values()].forEach(fn=>fn());assert.ok(frames.every(f=>wireBytes(f.message)<=2048));
 const receiver=new ChunkReceiver(),results=[];for(const f of frames){const r=receiver.receive(f.channel,f.message);if(r)results.push(r)}assert.equal(results[0].text,text);assert.equal(results[1].after,true);
 const tiny=new JsonSender(system,{maxFrames:1});assert.throws(()=>tiny.send('test',{text},'overflow'),/queue full/);assert.equal(tiny.status().queued,0);
});
