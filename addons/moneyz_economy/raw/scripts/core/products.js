import { world } from "@minecraft/server";
import * as Storage from "./storage.js";
import * as Economy from "./economy.js";
import * as Inventory from "../services/inventory.js";
import * as Entitlements from "./entitlements.js";
import * as Reservations from "./reservations.js";
import { emit } from "./events.js";
const db=Storage.namespace("products"),KEY="catalog",providers=new Map();const clean=v=>String(v??"").trim().toLowerCase().replace(/[^a-z0-9_.:-]/g,"_");
function load(){const v=db.get(KEY);return Array.isArray(v)?v:[];}const save=v=>(db.set(KEY,v),v);
export const list=({type,enabled=true}={})=>load().filter(x=>(!type||x.type===type)&&(enabled===undefined||(x.enabled!==false)===enabled));
export const all=()=>load();
export function importDefinitions(defs,{overwrite=false}={}){let added=0,updated=0,skipped=0;for(const def of defs??[]){const old=get(def?.id);if(old&&!overwrite){skipped++;continue;}upsert(def);old?updated++:added++;}return {ok:true,added,updated,skipped};}
export const exportDefinitions=()=>load().map(x=>({...x}));
export const get=id=>load().find(x=>x.id===clean(id))??null;
export function upsert(def){const a=load(),id=clean(def.id||def.name);if(!id)throw new Error("Product id required");const i=a.findIndex(x=>x.id===id),old=i>=0?a[i]:{};const p={...old,...def,id,name:String(def.name??old.name??id),type:def.type??old.type??"item",price:Math.max(0,Math.round(Number(def.price??old.price??0))),enabled:def.enabled??old.enabled??true};if(i>=0)a[i]=p;else a.push(p);save(a);emit("productChanged",{product:p});return p;}
export function remove(id){const a=load(),n=a.filter(x=>x.id!==clean(id));if(n.length===a.length)return false;save(n);return true;}
export function registerProvider(type,provider){type=clean(type);if(!type||typeof provider?.deliver!=="function")throw new Error("Product provider requires type and deliver()");providers.set(type,provider);return()=>providers.delete(type);}
export async function deliver(player,p,context={}){if(p.type==="item")return (await Inventory.give(player,p.itemId,p.amount??1,p.data??0))?{ok:true}:{ok:false,reason:"delivery_failed"};if(p.type==="bundle"){for(const item of p.contents??[]){if(item.type&&item.type!=="item")return {ok:false,reason:"unsupported_bundle_entry"};if(!await Inventory.give(player,item.itemId??item.id,item.amount??1,item.data??0))return {ok:false,reason:"bundle_delivery_failed"};}return {ok:true};}
 if(p.type==="pet"||p.type==="entity"){try{const loc=player.location,e=player.dimension.spawnEntity(p.entityId,{x:loc.x+1,y:loc.y,z:loc.z+1});for(const tag of p.tags??[])e.addTag(tag);if(p.nameTag)e.nameTag=p.nameTag;return {ok:true,entity:e};}catch{return {ok:false,reason:"spawn_failed"};}}
 if(p.type==="entitlement")return Entitlements.grant(player,p.entitlementId,{durationMs:p.durationMs,legacyTag:p.legacyTag,metadata:{productId:p.id}});
 if(p.type==="reservation")return Reservations.book(player,p.propertyId,{nights:p.nights??1,metadata:{productId:p.id}});
 if(p.type==="xp"){try{player.addExperience(Math.max(1,Math.floor(Number(p.xp)||1)));return {ok:true};}catch{return {ok:false,reason:"xp_delivery_failed"};}}
 if(p.type==="legacy_structure"){try{const pos=String(p.structurePosition??"~ ~ ~");await player.runCommand(`structure load ${p.structureName} ${pos}`);return {ok:true};}catch{return {ok:false,reason:"structure_delivery_failed"};}}
 const provider=providers.get(clean(p.type));if(provider)return await provider.deliver(player,p,context);return {ok:false,reason:"unknown_product_type"};}
export async function purchase(player,id,context={}){const p=get(id);if(!p||p.enabled===false)return {ok:false,reason:"unknown_product"};if(!Economy.withdraw(player,p.price,{type:"product_purchase",productId:p.id,productType:p.type,source:context.source??"products"}))return {ok:false,reason:"insufficient_funds"};const r=await deliver(player,p,context);if(!r?.ok){Economy.deposit(player,p.price,{type:"product_refund",productId:p.id,reason:r?.reason});return r??{ok:false,reason:"delivery_failed"};}emit("productPurchased",{player,product:p,result:r,context});return {ok:true,product:p,...r};}
