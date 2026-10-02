import { emit } from "../core/events.js";
import * as NpcMenus from "./npc_menus.js";
import * as NpcShops from "./npc_shops.js";
import * as Shops from "../repositories/shops.js";
import * as Services from "./services.js";
export const NPC_SERVICES_PROPERTY="moneyz:services";
function normalize(s){if(!s||typeof s!=="object")return null;let type=String(s.type??"service"),id=String(s.id??"");if(type==="menu")type="service";if(!["service","shop"].includes(type)||!id)return null;return {type,id,label:String(s.label??""),args:s.args&&typeof s.args==="object"?s.args:undefined};}
export function list(entity){if(!entity||entity.typeId!=="minecraft:npc")return[];const raw=entity.getDynamicProperty(NPC_SERVICES_PROPERTY);if(typeof raw==="string"&&raw)try{return JSON.parse(raw).map(normalize).filter(Boolean);}catch{}const out=[];const shop=NpcShops.assigned(entity);if(shop)out.push({type:"shop",id:String(shop),label:""});const menu=NpcMenus.assigned(entity);if(menu)out.push({type:"service",id:String(menu),label:""});return out;}
export function save(entity,services){if(!entity||entity.typeId!=="minecraft:npc")return{ok:false,reason:"not_npc"};const clean=(services??[]).map(normalize).filter(Boolean);entity.setDynamicProperty(NPC_SERVICES_PROPERTY,clean.length?JSON.stringify(clean):undefined);NpcMenus.clear(entity);NpcShops.clear(entity);emit("npcServicesChanged",{entity,services:clean});return{ok:true,services:clean};}
export function add(entity,service){const next=list(entity),s=normalize(service);if(!s)return{ok:false,reason:"invalid_service"};if(!next.some(x=>x.type===s.type&&x.id===s.id&&JSON.stringify(x.args??{})===JSON.stringify(s.args??{})))next.push(s);return save(entity,next);}
export function remove(entity,index){const next=list(entity);if(index<0||index>=next.length)return false;next.splice(index,1);return save(entity,next).ok;}
export function clear(entity){return save(entity,[]).ok;}
export function clearType(entity,type){return save(entity,list(entity).filter(x=>x.type!==type)).ok;}
export function resolve(service){const s=normalize(service);if(!s)return null;if(s.type==="shop"){const shop=Shops.getShop(s.id);return shop?{...s,label:s.label||shop.name||s.id}:null;}const svc=Services.get(s.id);if(svc)return{...s,id:svc.id,label:s.label||svc.label||svc.id,category:svc.category};const menu=NpcMenus.getMenu(s.id);return menu?{...s,id:menu.id,label:s.label||menu.label||menu.id,legacyMenu:true}:null;}
export function open(player,entity,service){const s=resolve(service);if(!s)return{ok:false,reason:"unknown_service"};if(s.type==="shop")return Services.open("moneyz:shop",player,{npc:entity,isNpcInteraction:true,shopId:s.id,args:{shopId:s.id}});return Services.open(s.id,player,{npc:entity,isNpcInteraction:true,args:s.args??{}});}
