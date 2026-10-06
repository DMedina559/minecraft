import * as Feedback from "./feedback.js";
import { safeEntityName } from "./entity_identity.js";
import * as Storage from "./storage.js";
import * as Economy from "./economy.js";
import * as Treasury from "./treasury.js";
import { emit } from "./events.js";
const db=Storage.namespace("properties");const KEY="listings";
const clean=v=>String(v??"").trim().toLowerCase().replace(/[^a-z0-9_.:-]/g,"_");
function load(){const v=db.get(KEY);return Array.isArray(v)?v:[];}function save(v){db.set(KEY,v);return v;}
export const scopeFields=["namespace","buildingId","communityId","provider"];
export function normalizeScope(value){return String(value??"").trim().toLowerCase();}
export function matchesScope(property,options={}){return !!property&&scopeFields.every(key=>options[key]===undefined||normalizeScope(property[key])===normalizeScope(options[key]));}
export function list(options={}){const {type,available}=options;return load().filter(x=>(!type||x.type===type)&&matchesScope(x,options)&&(available===undefined||Boolean(!x.owner&&!x.tenant)===available));}
export function get(id,scope){
 const key=clean(id),rows=load().filter(p=>scope===undefined||matchesScope(p,scope));
 const exact=rows.find(p=>p.id===key);if(exact)return exact;
 const aliases=rows.filter(p=>p.localId===key);return aliases.length===1?aliases[0]:null;
}
export function definitionId(def){
 const localId=clean(def.id||def.name);if(!localId)return "";
 if(localId.includes(":"))return localId;
 const scoped=scopeFields.some(k=>def[k]!==undefined&&normalizeScope(def[k]));
 if(!scoped){const found=get(localId);if(found)return found.id;if(load().filter(p=>p.localId===localId).length>1)throw new Error("Ambiguous property ID; use the full namespaced ID");return localId;}
 const existing=load().filter(p=>p.localId===localId&&matchesScope(p,def));if(existing.length===1)return existing[0].id;if(existing.length>1)throw new Error("Ambiguous property scope; include the building or full namespaced ID");
 // Retain existing global IDs in older saves when their supplied scopes agree.
 const legacy=load().find(p=>p.id===localId&&matchesScope(p,def));if(legacy)return legacy.id;
 const parts=scopeFields.filter(k=>def[k]!==undefined&&normalizeScope(def[k])).map(k=>`${k}.${encodeURIComponent(normalizeScope(def[k])).replace(/_/g,"_5f").replace(/%/g,"_")}`);
 return clean(`${parts.join(":")}:${localId}`);
}
function resolveId(id){return get(id)?.id??clean(id);}

export function upsert(def){const a=load(),id=definitionId(def);if(!id)throw new Error("Property id required");const i=a.findIndex(x=>x.id===id),old=i>=0?a[i]:{};const p={...old,...def,id,localId:old.localId??clean(def.id||def.name),namespace:normalizeScope(def.namespace??old.namespace),buildingId:normalizeScope(def.buildingId??old.buildingId),communityId:normalizeScope(def.communityId??old.communityId),name:String(def.name??old.name??id),type:["residential","hotel","commercial"].includes(def.type)?def.type:(old.type??"residential"),price:Math.max(0,Math.round(Number(def.price??old.price??0))),rent:Math.max(0,Math.round(Number(def.rent??old.rent??0))),rentInterval:Math.max(60,Math.round(Number(def.rentInterval??old.rentInterval??86400))),enabled:def.enabled!==false,provider:String(def.provider??old.provider??"world"),metadata:{...(old.metadata??{}),...(def.metadata??{})},access:{...(old.access??{}),...(def.access??{})}};if(i>=0)a[i]=p;else a.push(p);save(a);emit("propertyChanged",{property:p});return p;}
export function importDefinitions(defs,{overwrite=false}={}){let added=0,updated=0,skipped=0;for(const def of defs??[]){const old=get(definitionId(def));if(old&&!overwrite){skipped++;continue;}upsert(def);old?updated++:added++;}return {ok:true,added,updated,skipped};}
export const exportDefinitions=()=>load().map(x=>({...x}));
export function migrateLegacyPlayer(player){const a=load();let changed=0;for(let i=0;i<a.length;i++){const p=a[i],tag=p.legacyTag;if(!tag||p.owner||!player?.hasTag?.(tag))continue;p.owner=who(player);p.purchasedAt=p.purchasedAt??Date.now();a[i]=p;changed++;}if(changed)save(a);return {ok:true,changed};}
export function remove(id){const a=load(),n=a.filter(x=>x.id!==resolveId(id));if(n.length===a.length)return false;save(n);return true;}
const who=p=>safeEntityName(p,typeof p==="string"?p:"");
export function ownedBy(player,options={}){const n=who(player);return load().filter(x=>x.owner===n&&matchesScope(x,options));}
export function rentedBy(player,options={}){const n=who(player);return load().filter(x=>x.tenant===n&&matchesScope(x,options));}
function _audio_buy(player,id){const a=load(),i=a.findIndex(x=>x.id===resolveId(id));if(i<0)return {ok:false,reason:"unknown_property"};const p=a[i];if(p.type==="hotel")return {ok:false,reason:"not_for_sale"};if(p.owner||p.tenant)return {ok:false,reason:"unavailable"};if(!Economy.withdraw(player,p.price,{type:"property_purchase",propertyId:p.id}))return {ok:false,reason:"insufficient_funds"};Treasury.collect(p.price,{type:"property_purchase",propertyId:p.id});p.owner=who(player);p.purchasedAt=Date.now();a[i]=p;save(a);emit("propertyPurchased",{player,property:p});return {ok:true,property:p};}
function _audio_sell(player,id,{rate=1}={}){const a=load(),i=a.findIndex(x=>x.id===resolveId(id));if(i<0)return {ok:false,reason:"unknown_property"};const p=a[i];if(p.owner!==who(player))return {ok:false,reason:"not_owner"};const amount=Math.max(0,Math.round(p.price*rate));if(amount){const pay=Treasury.payout(amount,{type:"property_sale",propertyId:p.id});if(!pay.ok)return {ok:false,reason:pay.reason,required:amount,available:pay.balance};if(!Economy.deposit(player,amount,{type:"property_sale",propertyId:p.id})){Treasury.collect(amount,{type:"property_sale_rollback",propertyId:p.id});return {ok:false,reason:"payout_failed"};}}p.owner=undefined;p.purchasedAt=undefined;a[i]=p;save(a);emit("propertySold",{player,property:p,amount});return {ok:true,property:p,amount};}
function _audio_rent(player,id){const a=load(),i=a.findIndex(x=>x.id===resolveId(id));if(i<0)return {ok:false,reason:"unknown_property"};const p=a[i];if(p.owner||p.tenant)return {ok:false,reason:"unavailable"};if(!Economy.withdraw(player,p.rent,{type:p.type==="hotel"?"hotel_rent":"property_rent",propertyId:p.id}))return {ok:false,reason:"insufficient_funds"};Treasury.collect(p.rent,{type:"property_rent",propertyId:p.id});p.tenant=who(player);p.rentedAt=Date.now();p.nextRentAt=Date.now()+p.rentInterval*1000;a[i]=p;save(a);emit("propertyRented",{player,property:p});return {ok:true,property:p};}
function _audio_payRent(player,id){const a=load(),i=a.findIndex(x=>x.id===resolveId(id));if(i<0)return {ok:false,reason:"unknown_property"};const p=a[i];if(p.tenant!==who(player))return {ok:false,reason:"not_tenant"};if(Date.now()<Number(p.nextRentAt??0))return {ok:false,reason:"not_due",property:p};if(!Economy.withdraw(player,p.rent,{type:"rent_payment",propertyId:p.id}))return {ok:false,reason:"insufficient_funds",property:p};Treasury.collect(p.rent,{type:"rent_payment",propertyId:p.id});p.nextRentAt=Date.now()+p.rentInterval*1000;a[i]=p;save(a);emit("rentPaid",{player,property:p,amount:p.rent});return {ok:true,property:p,amount:p.rent};}
function _audio_checkout(player,id){const a=load(),i=a.findIndex(x=>x.id===resolveId(id));if(i<0)return {ok:false,reason:"unknown_property"};const p=a[i];if(p.tenant!==who(player))return {ok:false,reason:"not_tenant"};p.tenant=undefined;p.rentedAt=undefined;p.nextRentAt=undefined;a[i]=p;save(a);emit("propertyCheckout",{player,property:p});return {ok:true,property:p};}
export function status(player,options={}){return {owned:ownedBy(player,options),rented:rentedBy(player,options)};}

// Public Real Estate Platform API
export const registerProperty=upsert;
export function registerHotel(def){return upsert({...def,type:"hotel"});}
export const unregisterProperty=remove;
export function getOwner(id){return get(id)?.owner??null;}
export function canPurchase(player,id){const p=get(id);if(!p)return {ok:false,reason:"unknown_property"};if(p.type==="hotel")return {ok:false,reason:"not_for_sale"};if(p.owner||p.tenant)return {ok:false,reason:"unavailable"};if(!Economy.canAfford(player,p.price))return {ok:false,reason:"insufficient_funds"};return {ok:true,property:p};}
export function hasAccess(player,id){const p=get(id),n=who(player);if(!p||!n)return false;if(p.owner===n||p.tenant===n)return true;return Boolean(p.access?.[n]);}
function _audio_grantAccess(owner,id,player,role="guest"){const a=load(),i=a.findIndex(x=>x.id===resolveId(id));if(i<0)return {ok:false,reason:"unknown_property"};const p=a[i],o=who(owner),n=who(player);if(p.owner!==o||!n)return {ok:false,reason:"not_owner"};p.access={...(p.access??{}),[n]:String(role||"guest")};a[i]=p;save(a);emit("propertyAccessGranted",{owner,player,property:p,role:p.access[n]});return {ok:true,property:p};}
function _audio_revokeAccess(owner,id,player){const a=load(),i=a.findIndex(x=>x.id===resolveId(id));if(i<0)return {ok:false,reason:"unknown_property"};const p=a[i],o=who(owner),n=who(player);if(p.owner!==o)return {ok:false,reason:"not_owner"};if(p.access)delete p.access[n];a[i]=p;save(a);emit("propertyAccessRevoked",{owner,player,property:p});return {ok:true,property:p};}
export function listAccess(id){const p=get(id);return p?Object.entries(p.access??{}).map(([player,role])=>({player,role})):[];}
export function listHotels(options={}){return list({...options,type:"hotel"});}

// Audio outcome wrappers preserve all original return values.
export function buy(...args){return Feedback.run(args[0],()=>_audio_buy(...args),{});}
export function sell(...args){return Feedback.run(args[0],()=>_audio_sell(...args),{});}
export function rent(...args){return Feedback.run(args[0],()=>_audio_rent(...args),{});}
export function payRent(...args){return Feedback.run(args[0],()=>_audio_payRent(...args),{});}
export function checkout(...args){return Feedback.run(args[0],()=>_audio_checkout(...args),{});}
export function grantAccess(...args){return Feedback.run(args[0],()=>_audio_grantAccess(...args),{});}
export function revokeAccess(...args){return Feedback.run(args[0],()=>_audio_revokeAccess(...args),{});}
