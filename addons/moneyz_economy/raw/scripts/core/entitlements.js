import * as Storage from "./storage.js";
import { emit } from "./events.js";
const ns=p=>Storage.player(p,"entitlements");
const clean=v=>String(v??"").trim().toLowerCase().replace(/[^a-z0-9_.:-]/g,"_");
function data(player){const v=ns(player).get("grants");return v&&typeof v==="object"?v:{};}
function save(player,v){ns(player).set("grants",v);return v;}
export function grant(player,id,options={}){id=clean(id);if(!player||!id)return {ok:false,reason:"invalid"};const all=data(player),now=Date.now(),duration=Number(options.durationMs??0),expiresAt=Number(options.expiresAt??(duration>0?now+duration:0))||0;all[id]={id,grantedAt:now,expiresAt:expiresAt||undefined,metadata:options.metadata??{},legacyTag:options.legacyTag};save(player,all);if(options.legacyTag)try{player.addTag(options.legacyTag)}catch{}emit("entitlementGranted",{player,entitlement:all[id]});return {ok:true,entitlement:all[id]};}
export function revoke(player,id){id=clean(id);const all=data(player),old=all[id];if(!old)return false;delete all[id];save(player,all);if(old.legacyTag)try{player.removeTag(old.legacyTag)}catch{}emit("entitlementRevoked",{player,entitlement:old});return true;}
export function get(player,id){id=clean(id);const all=data(player),e=all[id];if(!e)return null;if(e.expiresAt&&Date.now()>=e.expiresAt){revoke(player,id);return null;}return e;}
export const has=(player,id)=>Boolean(get(player,id));
export function list(player){const all=data(player);return Object.keys(all).map(id=>get(player,id)).filter(Boolean);}
export function migrateTag(player,tag,id=tag,options={}){if(!player?.hasTag?.(tag)||has(player,id))return false;grant(player,id,{...options,legacyTag:tag,metadata:{...options.metadata,migratedFromTag:tag}});return true;}
