// Bounded ScriptEvent JSON transport; each pack is independently installable.
export class ChunkReceiver {
  constructor({maxStreams=128,maxChunks=256,maxChars=262144,ttlMs=30000}={}) { Object.assign(this,{maxStreams,maxChunks,maxChars,ttlMs}); this.streams=new Map(); }
  receive(channel,message,{allowDirect=false}={}) {
    this.expire();
    if(typeof message!=="string"||message.length>16384)throw Error("IPC frame too large");
    const frame=JSON.parse(message);
    if(!frame||typeof frame!=="object")throw Error("Invalid IPC payload");
    if(frame.chunk===undefined){if(allowDirect)return frame;throw Error("Expected chunk frame");}
    const {id,chunk,total,data}=frame;
    if(typeof id!=="string"||!id||id.length>128||!Number.isInteger(chunk)||!Number.isInteger(total)||total<1||total>this.maxChunks||chunk<0||chunk>=total||typeof data!=="string"||data.length>1400)throw Error("Invalid chunk frame");
    const key=channel+":"+id;
    let state=this.streams.get(key);
    if(state&&state.total!==total){this.streams.delete(key);throw Error("Chunk stream shape changed");}
    if(!state){if(this.streams.size>=this.maxStreams)throw Error("Too many IPC streams");state={total,parts:new Array(total),received:0,chars:0,time:Date.now()};this.streams.set(key,state);}
    if(state.parts[chunk]!==undefined){if(state.parts[chunk]!==data){this.streams.delete(key);throw Error("Conflicting duplicate chunk");}return null;}
    state.parts[chunk]=data;state.received++;state.chars+=data.length;
    if(state.chars>this.maxChars){this.streams.delete(key);throw Error("IPC message too large");}
    if(state.received!==total)return null;
    this.streams.delete(key);return JSON.parse(state.parts.join(""));
  }
  expire(){const now=Date.now();let expired=0;for(const [key,state] of this.streams)if(now-state.time>this.ttlMs){this.streams.delete(key);expired++;}return expired;}
}
export function wireBytes(text){let bytes=0;for(const char of text){const code=char.codePointAt(0);bytes+=code<128?1:code<2048?2:code<65536?3:4}return bytes;}
export function encodeFrames(channel,payload,id){
  if(typeof id!=="string"||!id||id.length>128)throw Error("Invalid IPC stream ID");
  const text=JSON.stringify(payload);if(typeof text!=="string"||text.length>262144)throw Error("IPC message too large");
  const parts=[];let start=0;
  do{
    let end=Math.min(text.length,start+1400),part=text.slice(start,end);
    while(wireBytes(JSON.stringify({__tui:1,id,chunk:255,total:256,data:part}))>2048){end=start+Math.floor((end-start)*0.8);if(end===start)throw Error("IPC frame cannot fit");part=text.slice(start,end)}
    parts.push(part);start=end;
  }while(start<text.length);
  if(parts.length>256)throw Error("IPC message requires too many chunks");
  return parts.map((data,chunk)=>({channel,message:JSON.stringify({__tui:1,id,chunk,total:parts.length,data})}));
}
export class JsonSender {
  constructor(system,{perTick=4,maxFrames=2048,maxBytes=4194304}={}){Object.assign(this,{system,perTick,maxFrames,maxBytes});this.queue=[];this.bytes=0;this.timer=null;this.metrics={sent:0,rejected:0,highWater:0,errors:0};}
  send(channel,payload,id){
    const frames=encodeFrames(channel,payload,id),bytes=frames.reduce((sum,f)=>sum+wireBytes(f.message),0);
    if(this.queue.length+frames.length>this.maxFrames||this.bytes+bytes>this.maxBytes){this.metrics.rejected++;throw Error("Outgoing IPC queue full");}
    this.queue.push(...frames);this.bytes+=bytes;this.metrics.highWater=Math.max(this.metrics.highWater,this.queue.length);
    if(this.timer===null)this.timer=this.system.runInterval(()=>this.flush(),1);
    return frames.length;
  }
  flush(){
    for(let n=0;n<this.perTick&&this.queue.length;n++){
      const frame=this.queue.shift();this.bytes-=wireBytes(frame.message);
      try{this.system.sendScriptEvent(frame.channel,frame.message);this.metrics.sent++}catch(e){this.metrics.errors++;console.warn(`[IPC] send failed: ${e.message}`)}
    }
    if(!this.queue.length){this.system.clearRun(this.timer);this.timer=null;}
  }
  status(){return {...this.metrics,queued:this.queue.length,bytes:this.bytes};}
}
const senders=new WeakMap();
export function senderStatus(system){return senders.get(system)?.status()??{queued:0,bytes:0,sent:0,rejected:0,highWater:0,errors:0};}
export function sendJson(system,channel,payload,id){
  if(!system.runInterval){for(const f of encodeFrames(channel,payload,id))system.sendScriptEvent(f.channel,f.message);return;}
  let sender=senders.get(system);if(!sender){sender=new JsonSender(system);senders.set(system,sender)}return sender.send(channel,payload,id);
}
