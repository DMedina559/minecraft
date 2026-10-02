import { emit } from "../core/events.js";
export const NPC_SHOP_PROPERTY="moneyz:shop";
export function assign(entity,shopId){if(!entity||entity.typeId!=="minecraft:npc")return {ok:false,reason:"not_npc"};entity.setDynamicProperty(NPC_SHOP_PROPERTY,String(shopId));emit("npcShopAssigned",{entity,shopId:String(shopId)});return {ok:true,shopId:String(shopId)};}
export function clear(entity){if(!entity||entity.typeId!=="minecraft:npc")return false;entity.setDynamicProperty(NPC_SHOP_PROPERTY,undefined);return true;}
export const assigned=entity=>entity?.getDynamicProperty(NPC_SHOP_PROPERTY)??null;
