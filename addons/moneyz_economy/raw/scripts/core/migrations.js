import { world } from "@minecraft/server";
import { log, LOG_LEVELS } from "../logger.js";
export const SCHEMA_VERSION=2;
const KEY="moneyz:schemaVersion";
export function getSchemaVersion(){return Number(world.getDynamicProperty(KEY)??0)||0;}
export function runMigrations(){let v=getSchemaVersion();if(v>=SCHEMA_VERSION)return {from:v,to:v,changed:false};const from=v;try{
  // v1/v2 are intentionally compatibility-first: retain legacy keys while marking the world for new services.
  if(v<1){world.setDynamicProperty("moneyz:installed",true);v=1;}
  if(v<2){world.setDynamicProperty("moneyz:apiVersion","2.0.0");v=2;}
  world.setDynamicProperty(KEY,v);log(`Moneyz schema migrated ${from} -> ${v}`,LOG_LEVELS.INFO);return {from,to:v,changed:true};
}catch(e){log(`Moneyz migration failed: ${e}`,LOG_LEVELS.ERROR);return {from,to:v,changed:false,error:String(e)};}}
