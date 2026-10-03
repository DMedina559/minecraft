import { system, world } from "@minecraft/server";
import { log, LOG_LEVELS } from "./logger.js";
import { registerCommands } from "./api/commands.js";
import { initializeScriptEvents } from "./api/script_events.js";
import { runMigrations } from "./core/migrations.js";
import { migrateLegacy as migrateCustomShop, getItems as getLegacyCustomItems } from "./repositories/custom_shop.js";
import { migrateLegacyCustomShop as migrateCustomShopV3 } from "./repositories/shops.js";
import * as Config from "./core/config.js";
import { initializeQuestEngine } from "./quest/engine.js";
import { initialize as initializeComponents } from "./core/components.js";
import "./utilities.js";
import "./gui/moneyz_menu.js";
import * as Jobs from "./core/jobs.js";
import * as Entitlements from "./core/entitlements.js";
import * as Reservations from "./core/reservations.js";
import * as Properties from "./core/properties.js";
system.beforeEvents.startup.subscribe(event=>{try{initializeComponents(event);registerCommands(event.customCommandRegistry);}catch(e){log(`Custom command registration failed: ${e}`,LOG_LEVELS.ERROR);}});
system.run(()=>{runMigrations();migrateCustomShop();migrateCustomShopV3(getLegacyCustomItems(),Config.get("customShop","Custom Shop"));initializeQuestEngine();});
initializeScriptEvents();
world.afterEvents.playerSpawn.subscribe(({player,initialSpawn})=>{
 if(!initialSpawn||!player)return;
 system.run(()=>{
  // GameTest simulated players can be removed before this deferred migration runs.
  // Treat an invalid/missing player as a normal lifecycle race, not a Moneyz error.
  try{if(typeof player.isValid==="function"&&!player.isValid())return;}catch{return;}
  try{Jobs.migrateLegacy(player);Properties.migrateLegacyPlayer(player);for(const tag of ["resident","citizen","hotel","hoteldeluxe"])Entitlements.migrateTag(player,tag,`legacy:${tag}`);Reservations.expire();}
  catch(e){log(`Player legacy migration skipped: ${e}`,LOG_LEVELS.DEBUG);}
 });
});
log("main.js loaded",LOG_LEVELS.INFO);

// Test-build only: comprehensive internal GameTest suite.
//import "./tests/main.js";
