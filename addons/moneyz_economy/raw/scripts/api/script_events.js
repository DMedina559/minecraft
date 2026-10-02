import { system, ScriptEventSource } from "@minecraft/server";
import { reloadShops } from "../repositories/shops.js";
import { formatHealth } from "../core/health.js";
import { runMigrations } from "../core/migrations.js";
import { log, LOG_LEVELS } from "../logger.js";
import * as Services from "./services.js";
import * as NpcServices from "./npc_services.js";
function actor(event){return event.initiator??(event.sourceEntity?.typeId==="minecraft:player"?event.sourceEntity:null);}
export function initializeScriptEvents(){system.afterEvents.scriptEventReceive.subscribe(event=>{if(!event.id?.startsWith("moneyz:"))return;switch(event.id){
 case"moneyz:reload":case"moneyz:shop/reload":reloadShops();break;
 case"moneyz:health":log(formatHealth(),LOG_LEVELS.INFO);break;
 case"moneyz:migrate":if(event.sourceType===ScriptEventSource.Server)runMigrations();break;
 case"moneyz:menu/open":case"moneyz:service/open":{const player=actor(event);if(!player)return;const id=event.message?.trim()||"moneyz:menu";system.run(()=>Services.open(id,player,{source:"scriptevent",sourceEntity:event.sourceEntity}));break;}
 case"moneyz:shop/open":{const player=actor(event);if(!player)return;const shopId=event.message?.trim();system.run(()=>Services.open("moneyz:shop",player,{source:"scriptevent",shopId}));break;}
 case"moneyz:npc/assign":{if(event.sourceType!==ScriptEventSource.Server&&event.sourceType!==ScriptEventSource.NPCDialogue)return;const npc=event.sourceEntity,id=event.message?.trim();if(npc?.typeId==="minecraft:npc"&&Services.exists(id))NpcServices.add(npc,{type:"service",id});break;}
 default:log(`Ignored unknown script event ${event.id}`,LOG_LEVELS.DEBUG);
 }});}
