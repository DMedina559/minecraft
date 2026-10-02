import { world } from "@minecraft/server";
const valid=s=>{s=String(s);if(!/^[a-z0-9_.-]+$/i.test(s))throw new Error("Storage namespace/key contains invalid characters");return s;};
const enc=v=>JSON.stringify(v); const dec=v=>{if(v===undefined)return undefined;try{return JSON.parse(v)}catch{return v}};
export function namespace(ns){ns=valid(ns);const p=`moneyz:ext:${ns}:`;return Object.freeze({get:k=>dec(world.getDynamicProperty(p+valid(k))),set:(k,v)=>world.setDynamicProperty(p+valid(k),enc(v)),delete:k=>world.setDynamicProperty(p+valid(k),undefined),has:k=>world.getDynamicProperty(p+valid(k))!==undefined});}
export function player(player,ns){if(!player)throw new Error("Player required");ns=valid(ns);const p=`moneyz:ext:${ns}:`;return Object.freeze({get:k=>dec(player.getDynamicProperty(p+valid(k))),set:(k,v)=>player.setDynamicProperty(p+valid(k),enc(v)),delete:k=>player.setDynamicProperty(p+valid(k),undefined),has:k=>player.getDynamicProperty(p+valid(k))!==undefined});}
