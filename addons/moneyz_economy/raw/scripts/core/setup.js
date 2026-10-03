import { world } from "@minecraft/server";
import { log, LOG_LEVELS } from "../logger.js";

/** Idempotent scripted equivalent of the legacy functions/setup.mcfunction. */
export function setupWorld(player,{grantItems=true}={}){
 if(!player)return {ok:false,reason:"player_required"};
 try{
  let objective=world.scoreboard.getObjective("Moneyz");
  const created=!objective;
  if(!objective)objective=world.scoreboard.addObjective("Moneyz","Moneyz");
  let initialized=0;
  for(const p of world.getPlayers()){
   try{if(objective.getScore(p)===undefined){objective.setScore(p,0);initialized++;}}
   catch{try{objective.setScore(p,0);initialized++;}catch{}}
  }
  player.addTag("moneyzAdmin");
  if(grantItems){
   try{player.runCommand("give @s spawn_egg 1 51");}catch{}
   try{player.runCommand("give @s zvortex:moneyz_menu");}catch{}
  }
  return {ok:true,created,initialized};
 }catch(error){log(`Moneyz setup failed: ${error}`,LOG_LEVELS.ERROR);return {ok:false,reason:"setup_failed",message:String(error)};}
}
