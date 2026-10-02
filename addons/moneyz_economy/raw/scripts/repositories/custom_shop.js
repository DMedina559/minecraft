import { world } from "@minecraft/server";
import { log, LOG_LEVELS } from "../logger.js";
const LEGACY_PREFIX="shopItem_", KEY="moneyz:customShop:v2";
let cache;
function normalize(x={}){return {id:x.id??x.itemName??"",name:x.name??x.itemName??x.id??"",buyAmount:Number(x.buyAmount??0)||0,buyCost:Number(x.buyCost??0)||0,buyData:Number(x.buyData??0)||0,sellAmount:Number(x.sellAmount??0)||0,sellCost:Number(x.sellCost??0)||0,sellData:Number(x.sellData??0)||0};}
function legacy(){const out=[];for(const id of world.getDynamicPropertyIds()){if(!id.startsWith(LEGACY_PREFIX))continue;const raw=world.getDynamicProperty(id);if(typeof raw!=="string")continue;const [itemName,buyAmount,buyCost,buyData,sellAmount,sellCost,sellData]=raw.split(",");out.push(normalize({id:itemName,itemName,buyAmount,buyCost,buyData,sellAmount,sellCost,sellData}));}return out;}
export function reload(){try{const raw=world.getDynamicProperty(KEY);if(typeof raw==="string"){const data=JSON.parse(raw);if(Array.isArray(data)){cache=data.map(normalize);return cache;}}}catch(e){log(`Custom shop v2 data invalid: ${e}`,LOG_LEVELS.WARN);}cache=legacy();return cache;}
export function getItems(){return cache??reload();}
export function saveItems(items){cache=(items??[]).map(normalize);world.setDynamicProperty(KEY,JSON.stringify(cache));return cache;}
export function migrateLegacy(){if(typeof world.getDynamicProperty(KEY)==="string")return false;const items=legacy();if(!items.length)return false;saveItems(items);return true;}
