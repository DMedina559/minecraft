import { world } from "@minecraft/server";
import { emit } from "../core/events.js";
export const NPC_MENU_PROPERTY="moneyz:menu";
const menus=new Map();
export function registerMenu(id,handler,{label=id}={}){id=String(id);if(!id.includes(":"))id=`moneyz:${id}`;if(typeof handler!=="function")throw new TypeError("NPC menu handler required");menus.set(id,{id,label,handler});return()=>menus.delete(id);}
export function getMenu(id){if(!id)return null;id=String(id);return menus.get(id)??menus.get(id.includes(":")?id:`moneyz:${id}`)??null;}
export function listMenus(){return [...menus.values()].map(({handler,...x})=>x);}
export function assign(entity,id){const menu=getMenu(id);if(!entity||entity.typeId!=="minecraft:npc")return {ok:false,reason:"not_npc"};if(!menu)return {ok:false,reason:"unknown_menu"};entity.setDynamicProperty(NPC_MENU_PROPERTY,menu.id);emit("npcMenuAssigned",{entity,menu:menu.id});return {ok:true,menu:menu.id};}
export function clear(entity){if(!entity||entity.typeId!=="minecraft:npc")return false;entity.setDynamicProperty(NPC_MENU_PROPERTY,undefined);return true;}
export function assigned(entity){return entity?.getDynamicProperty(NPC_MENU_PROPERTY)??null;}
export function nearest(player,maxDistance=6){return player?.dimension.getEntities({type:"minecraft:npc",location:player.location,maxDistance,closest:1})?.[0]??null;}
export function assignNearest(player,id,maxDistance=6){const npc=nearest(player,maxDistance);return npc?assign(npc,id):{ok:false,reason:"no_nearby_npc"};}
export function dispatch(player,entity){const menu=getMenu(assigned(entity));if(!menu)return false;menu.handler(player,{npc:entity,isNpcInteraction:true,menuId:menu.id});return true;}
