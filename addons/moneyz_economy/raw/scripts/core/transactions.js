import { world } from "@minecraft/server";
import { log, LOG_LEVELS } from "../logger.js";
import { emit } from "./events.js";

const KEY = "moneyz:transactions";
const MAX = 150;
let cache;
const nameOf = value => value?.name ?? value?.nameTag ?? value ?? null;
const safeMetadata = metadata => { try { JSON.stringify(metadata); return metadata ?? {}; } catch { return { note: "unserializable metadata omitted" }; } };
function load() { if (cache) return cache; try { const raw=world.getDynamicProperty(KEY); cache=typeof raw==="string"?JSON.parse(raw):[]; if(!Array.isArray(cache))cache=[]; } catch { cache=[]; } return cache; }
function save() { try { world.setDynamicProperty(KEY, JSON.stringify(load().slice(-MAX))); } catch(e) { log(`Transaction persistence failed: ${e}`,LOG_LEVELS.WARN); } }
export function record(type,{actor,from,to,amount=0,balanceBefore,balanceAfter,metadata={}}={}) {
    const tx={id:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,at:Date.now(),type:String(type||"unknown"),actor:nameOf(actor),from:nameOf(from),to:nameOf(to),amount:Math.round(Number(amount)||0),balanceBefore:Number.isFinite(balanceBefore)?balanceBefore:null,balanceAfter:Number.isFinite(balanceAfter)?balanceAfter:null,metadata:safeMetadata(metadata)};
    load().push(tx); if(cache.length>MAX)cache.splice(0,cache.length-MAX); save(); emit("transaction",tx); return tx;
}
export function recent(limit=25,{player,type}={}) { let rows=[...load()].reverse(); if(player){const n=nameOf(player);rows=rows.filter(t=>t.actor===n||t.from===n||t.to===n);} if(type)rows=rows.filter(t=>t.type===type); return rows.slice(0,Math.max(1,limit)); }
export function find(id){return load().find(t=>t.id===id);}
export function count(){return load().length;}
export function clear(){cache=[];save();emit("transactionsCleared",{});}
export function exportJson(){return JSON.stringify(load());}
