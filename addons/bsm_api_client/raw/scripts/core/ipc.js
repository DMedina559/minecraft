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
export function sendJson(system,channel,payload,id){
  const text=JSON.stringify(payload),total=Math.max(1,Math.ceil(text.length/1400));
  if(text.length>262144||total>256)throw Error("IPC message too large");
  for(let chunk=0;chunk<total;chunk++)system.sendScriptEvent(channel,JSON.stringify({__tui:1,id,chunk,total,data:text.slice(chunk*1400,(chunk+1)*1400)}));
}
