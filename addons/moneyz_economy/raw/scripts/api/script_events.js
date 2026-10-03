import { system, world, ScriptEventSource } from "@minecraft/server";
import { reloadShops } from "../repositories/shops.js";
import { formatHealth } from "../core/health.js";
import { runMigrations } from "../core/migrations.js";
import { log, LOG_LEVELS } from "../logger.js";
import * as Services from "./services.js";
import * as NpcServices from "./npc_services.js";
import * as Jobs from "../core/jobs.js";
import { handleApiRequest } from "./gateway.js";
import { safeEntityName, isEntityUsable } from "../core/entity_identity.js";
function actor(event){return event.initiator??(event.sourceEntity?.typeId==="minecraft:player"?event.sourceEntity:null);}
function payload(event){
 const raw=event.message?.trim()??"";
 if(!raw)return {};
 try{const v=JSON.parse(raw);return v&&typeof v==="object"?v:{value:raw};}catch{return {value:raw};}
}
function targetPlayer(event,data=payload(event)){
 const direct=actor(event);
 if(direct)return direct;
 const name=String(data.player??data.playerName??"").trim();
 if(!name)return null;
 return world.getPlayers().find(p=>isEntityUsable(p)&&safeEntityName(p,"")===name)??null;
}
function runForTarget(event,data,callback){
 // Resolve/call on the next tick. This is important for external ScriptEvents and
 // GameTest simulated players: the event may be received before the spawned player
 // is visible through world.getPlayers(), and mutation is safer outside the receive callback.
 const direct=actor(event);
 const name=String(data.player??data.playerName??"").trim();
 system.run(()=>{
  let player=direct;
  if(!player&&name)player=world.getPlayers().find(p=>isEntityUsable(p)&&safeEntityName(p,"")===name)??null;
  if(!player)return;
  try{callback(player);}catch(error){log(`ScriptEvent target operation failed: ${error}`,LOG_LEVELS.ERROR);}
 });
}
export function initializeScriptEvents(){system.afterEvents.scriptEventReceive.subscribe(event=>{if(!event.id?.startsWith("moneyz:"))return;switch(event.id){
 case"moneyz:api/request":handleApiRequest(event);break;
 case"moneyz:reload":case"moneyz:shop/reload":reloadShops();break;
 case"moneyz:health":log(formatHealth(),LOG_LEVELS.INFO);break;
 case"moneyz:migrate":if(event.sourceType===ScriptEventSource.Server)runMigrations();break;
 case"moneyz:menu/open":case"moneyz:service/open":{const player=actor(event);if(!player)return;const id=event.message?.trim()||"moneyz:menu";system.run(()=>Services.open(id,player,{source:"scriptevent",sourceEntity:event.sourceEntity}));break;}
 case"moneyz:shop/open":{const player=actor(event);if(!player)return;const shopId=event.message?.trim();system.run(()=>Services.open("moneyz:shop",player,{source:"scriptevent",shopId}));break;}
 case"moneyz:job/apply":{const data=payload(event);runForTarget(event,data,player=>Jobs.grantApplication(player,{source:"scriptevent"}));break;}
 case"moneyz:job/join":{const data=payload(event),id=String(data.job??data.id??data.value??"").trim();if(id)runForTarget(event,data,player=>Jobs.join(player,id,{source:"scriptevent"}));break;}
 case"moneyz:job/quit":{const data=payload(event);runForTarget(event,data,player=>Jobs.leave(player,{source:"scriptevent"}));break;}
 case"moneyz:npc/assign":{if(event.sourceType!==ScriptEventSource.Server&&event.sourceType!==ScriptEventSource.NPCDialogue)return;const npc=event.sourceEntity,id=event.message?.trim();if(npc?.typeId==="minecraft:npc"&&Services.exists(id))NpcServices.add(npc,{type:"service",id});break;}
 default:log(`Ignored unknown script event ${event.id}`,LOG_LEVELS.DEBUG);
 }});}
