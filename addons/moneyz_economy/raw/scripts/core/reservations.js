import { safeEntityName } from "./entity_identity.js";
import * as Storage from "./storage.js";
import * as Economy from "./economy.js";
import * as Properties from "./properties.js";
import * as Entitlements from "./entitlements.js";
import { emit } from "./events.js";
const db=Storage.namespace("reservations"),KEY="records";const clean=v=>String(v??"").trim().toLowerCase().replace(/[^a-z0-9_.:-]/g,"_");
function load(){const v=db.get(KEY);return Array.isArray(v)?v:[];}const save=v=>(db.set(KEY,v),v);const who=p=>safeEntityName(p,"");
export function list({player,status}={}){const n=player?who(player):null;return load().filter(r=>(!n||r.guest===n)&&(!status||r.status===status));}
export const activeFor=p=>list({player:p,status:"active"}).filter(r=>!r.endsAt||r.endsAt>Date.now());
export function book(player,propertyId,{nights=1,durationMs,metadata={}}={}){const p=Properties.get(propertyId);if(!p||p.type!=="hotel"||p.enabled===false)return {ok:false,reason:"invalid_room"};const a=load();if(a.some(r=>r.propertyId===p.id&&r.status==="active"&&(!r.endsAt||r.endsAt>Date.now())))return {ok:false,reason:"unavailable"};nights=Math.max(1,Math.floor(Number(nights)||1));const span=Math.max(60000,Number(durationMs??p.rentInterval*1000*nights));const amount=Math.max(0,p.rent*nights);if(!Economy.withdraw(player,amount,{type:"hotel_booking",propertyId:p.id,nights}))return {ok:false,reason:"insufficient_funds"};const now=Date.now(),r={id:`res_${now}_${Math.random().toString(36).slice(2,7)}`,propertyId:p.id,guest:who(player),startsAt:now,endsAt:now+span,nights,amount,status:"active",metadata};a.push(r);save(a);Entitlements.grant(player,`moneyz:hotel:${p.id}`,{expiresAt:r.endsAt,metadata:{reservationId:r.id}});emit("reservationBooked",{player,reservation:r,property:p});return {ok:true,reservation:r,property:p};}
export function checkout(player,id){const a=load(),i=a.findIndex(r=>r.id===id);if(i<0)return {ok:false,reason:"unknown_reservation"};const r=a[i];if(r.guest!==who(player))return {ok:false,reason:"not_guest"};r.status="checked_out";r.checkedOutAt=Date.now();a[i]=r;save(a);Entitlements.revoke(player,`moneyz:hotel:${r.propertyId}`);emit("reservationCheckout",{player,reservation:r});return {ok:true,reservation:r};}
export function expire(){const a=load(),now=Date.now();let changed=0;for(const r of a)if(r.status==="active"&&r.endsAt<=now){r.status="expired";changed++;}if(changed)save(a);return changed;}
