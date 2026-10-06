import * as Permissions from "../core/permissions.js";
import * as Feedback from "../core/feedback.js";
import { withRoute } from "../ui/navigation.js";
import { world } from "@minecraft/server";
import { emit } from "../core/events.js";
export const NPC_MENU_PROPERTY="moneyz:menu";
const menus=new Map();
export function registerMenu(id,handler,{label=id,adminOnly=false,permission,canOpen}={}){id=String(id);if(!id.includes(":"))id=`moneyz:${id}`;if(typeof handler!=="function")throw new TypeError("NPC menu handler required");menus.set(id,{id,label,handler,adminOnly,permission,canOpen});return()=>menus.delete(id);}
export function getMenu(id){if(!id)return null;id=String(id);return menus.get(id)??menus.get(id.includes(":")?id:`moneyz:${id}`)??null;}
export function listMenus(){return [...menus.values()].map(({handler,...x})=>x);}
export function assign(entity,id){const menu=getMenu(id);if(!entity||entity.typeId!=="minecraft:npc")return {ok:false,reason:"not_npc"};if(!menu)return {ok:false,reason:"unknown_menu"};entity.setDynamicProperty(NPC_MENU_PROPERTY,menu.id);emit("npcMenuAssigned",{entity,menu:menu.id});return {ok:true,menu:menu.id};}
export function clear(entity){if(!entity||entity.typeId!=="minecraft:npc")return false;entity.setDynamicProperty(NPC_MENU_PROPERTY,undefined);return true;}
export function assigned(entity){return entity?.getDynamicProperty(NPC_MENU_PROPERTY)??null;}
export function nearest(player,maxDistance=6){return player?.dimension.getEntities({type:"minecraft:npc",location:player.location,maxDistance,closest:1})?.[0]??null;}
export function assignNearest(player,id,maxDistance=6){if(!Permissions.has(player,"moneyz.admin"))return{ok:false,reason:"permission_denied"};const npc=nearest(player,maxDistance);return npc?assign(npc,id):{ok:false,reason:"no_nearby_npc"};}
export function canOpen(id,player,context={}){const menu=getMenu(id);if(!menu)return{ok:false,reason:"unknown_menu"};try{if((menu.adminOnly&&!Permissions.has(player,"moneyz.admin"))||(menu.permission&&!Permissions.has(player,menu.permission)))return{ok:false,reason:"permission_denied"};const result=menu.canOpen?.(player,context);return result===false||result?.ok===false||result?.allowed===false?{ok:false,reason:result?.reason??"permission_denied"}:{ok:true};}catch{return{ok:false,reason:"menu_check_failed"};}}
export function open(player,entity,id){const menu=getMenu(id),context={npc:entity,npcInteract:true,isNpcInteraction:true,menuId:menu?.id};const access=canOpen(id,player,context);if(!access.ok){Feedback.message(player,"§cYou do not have permission to use this NPC menu.");return access;}const value=withRoute({type:"npcMenu",id:menu.id,context,args:context,guard:p=>canOpen(menu.id,p,context).ok},()=>menu.handler(player,context));return{ok:true,value};}
export function dispatch(player,entity){return open(player,entity,assigned(entity)).ok;}
