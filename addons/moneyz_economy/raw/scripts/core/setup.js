import { world, ItemStack } from "@minecraft/server";
import { log, LOG_LEVELS } from "../logger.js";

export const MONEYZ_MENU_ITEM = "zvortex:moneyz_menu";

function inventory(player) {
  try { return player?.getComponent("minecraft:inventory")?.container; } catch { return undefined; }
}

export function countMenuItems(player) {
  const c = inventory(player);
  if (!c) return 0;
  let count = 0;
  for (let i = 0; i < c.size; i++) {
    try { const item = c.getItem(i); if (item?.typeId === MONEYZ_MENU_ITEM) count += item.amount; } catch {}
  }
  return count;
}

/** Grants the Moneyz launcher only when the player does not already have one. */
export function grantMenuItem(player) {
  if (!player) return { ok: false, reason: "player_required" };
  if (countMenuItems(player) > 0) return { ok: true, granted: false, reason: "already_has_menu" };
  const c = inventory(player);
  if (!c) return { ok: false, reason: "inventory_unavailable" };
  try {
    const item = new ItemStack(MONEYZ_MENU_ITEM, 1);
    item.setLore(["§7Open the Moneyz Economy menu", "§8Moneyz Economy 2.0"]);
    const leftover = c.addItem(item);
    if (leftover) return { ok: false, reason: "inventory_full" };
    return { ok: true, granted: true };
  } catch (error) {
    log(`Moneyz menu item grant failed: ${error}`, LOG_LEVELS.WARN);
    return { ok: false, reason: "grant_failed", message: String(error) };
  }
}

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
  let menu={ok:true,granted:false};
  if(grantItems){
   try{player.runCommand("give @s spawn_egg 1 51");}catch{}
   menu=grantMenuItem(player);
  }
  return {ok:true,created,initialized,menu};
 }catch(error){log(`Moneyz setup failed: ${error}`,LOG_LEVELS.ERROR);return {ok:false,reason:"setup_failed",message:String(error)};}
}
