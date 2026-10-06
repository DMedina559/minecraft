import * as Permissions from "../core/permissions.js";
import * as Feedback from "../core/feedback.js";
import { withRoute, configureAccessChecker } from "../ui/navigation.js";
import { emit } from "../core/events.js";
const services=new Map();
const norm=id=>{id=String(id??"").trim();return id&&!id.includes(":")?`moneyz:${id}`:id;};
export function register(def){if(!def||typeof def.open!=="function")throw new TypeError("Moneyz service requires open()");const id=norm(def.id);if(!id)throw new Error("Moneyz service requires an id");if(services.has(id))throw new Error(`Moneyz service already registered: ${id}`);const service={id,label:def.label??id,category:def.category??"general",description:def.description??"",adminOnly:def.adminOnly===true,permission:def.permission,canOpen:def.canOpen,open:def.open};services.set(id,service);emit("serviceRegistered",{service:{...service,open:undefined,canOpen:undefined}});return()=>services.delete(id);}
export function get(id){return services.get(norm(id))??null;}
export function exists(id){return !!get(id);}
export function list({category}={}){let a=[...services.values()];if(category)a=a.filter(x=>x.category===category);return a.map(({open,canOpen,...x})=>x).sort((a,b)=>a.category.localeCompare(b.category)||a.label.localeCompare(b.label));}
export function canOpen(id,player,context={}){const s=get(id);if(!s)return {ok:false,reason:"unknown_service"};try{if((s.adminOnly&&!Permissions.has(player,"moneyz.admin"))||(s.permission&&!Permissions.has(player,s.permission)))return {ok:false,reason:"permission_denied"};const r=s.canOpen?.(player,context);if(r===false)return {ok:false,reason:"permission_denied"};if(r&&typeof r==="object"&&(r.allowed===false||r.ok===false))return {ok:false,reason:r.reason??"permission_denied"};return {ok:true};}catch{return {ok:false,reason:"service_check_failed"};}}
function _audio_open(id,player,context={}){const s=get(id);if(!s)return {ok:false,reason:"unknown_service"};context={...context,npcInteract:context.npcInteract===true||context.isNpcInteraction===true};context.isNpcInteraction=context.npcInteract;const access=canOpen(id,player,context);if(!access.ok){Feedback.message(player,`§cThis service is unavailable: ${access.reason}.`);return access;}try{const value=withRoute({type:"service",id:s.id,label:s.label,guard:p=>canOpen(s.id,p,context).ok,args:{...context.args,...context},context},()=>s.open(player,{...context,serviceId:s.id}));emit("serviceOpened",{service:s.id,player,context});return {ok:true,value};}catch(error){Feedback.message(player,"§cMoneyz could not open that service.");return {ok:false,reason:"service_error",error};}}

// Audio outcome wrappers preserve all original return values.
export function open(...args){return Feedback.run(args[1],()=>_audio_open(...args),{errorOnly:true});}

configureAccessChecker((route,player)=>route.type!=="service"||canOpen(route.id,player,route.context??route.args??{}).ok);
