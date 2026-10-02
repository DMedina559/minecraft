import { world } from "@minecraft/server";
import { itemData as defaults } from "../item_data.js";
import { log, LOG_LEVELS } from "../logger.js";
import { emit } from "../core/events.js";
import { shops as shopExtensions } from "../api/extensions.js";
export const SHOP_DATA_PREFIX="shop_"; let cache;
const cloneDefaults=()=>JSON.parse(JSON.stringify(defaults));
export function reloadShops(){const next=cloneDefaults();try{for(const id of world.getDynamicPropertyIds()){if(!id.startsWith(SHOP_DATA_PREFIX))continue;const raw=world.getDynamicProperty(id);if(typeof raw!=="string")continue;const shopId=id.slice(SHOP_DATA_PREFIX.length);try{next[shopId]={...(next[shopId]||{}),...JSON.parse(raw)};}catch(e){log(`ShopRepository: invalid ${shopId}: ${e}`,LOG_LEVELS.ERROR);}}}catch(e){log(`ShopRepository.reload failed: ${e}`,LOG_LEVELS.ERROR);}cache=next;emit("shopsReloaded",{count:Object.keys(next).length});return cache;}
export function getShopData(){return cache??reloadShops();} export function getShop(id){return getShopData()[id];}
export function saveShop(id,value){world.setDynamicProperty(SHOP_DATA_PREFIX+id,JSON.stringify(value));cache=null;const result=getShopData()[id];emit("shopChanged",{id,action:"save",shop:result});return result;}
export function deleteShop(id){world.setDynamicProperty(SHOP_DATA_PREFIX+id,undefined);cache=null;reloadShops();emit("shopChanged",{id,action:"delete"});}
export function stats(){const data=getShopData();let categories=0,items=0;for(const shop of Object.values(data)){categories+=Object.keys(shop??{}).length;for(const rows of Object.values(shop??{}))if(Array.isArray(rows))items+=rows.length;}return {shops:Object.keys(data).length,categories,items};}

export function list(){const builtIn=Object.entries(getShopData()).map(([id,data])=>({id,source:"moneyz",data}));const external=[];for(const provider of shopExtensions.providers()){try{for(const shop of provider.getShops?.()??[])external.push({...shop,source:provider.id,provider});}catch{}}return [...builtIn,...external];}
export function providerFor(id){return shopExtensions.providers().find(p=>p.getShop?.(id)||p.getShops?.().some?.(s=>s.id===id))??null;}
