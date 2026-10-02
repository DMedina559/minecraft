import { system } from "@minecraft/server";
import { log, LOG_LEVELS } from "./logger.js";
import { registerCommands } from "./api/commands.js";
import { initializeScriptEvents } from "./api/script_events.js";
import "./utilities.js";
import "./gui/moneyz_menu.js";

system.beforeEvents.startup.subscribe(event => {
    try { registerCommands(event.customCommandRegistry); }
    catch (e) { log(`Custom command registration failed: ${e}`, LOG_LEVELS.ERROR); }
});
initializeScriptEvents();
log("main.js loaded", LOG_LEVELS.INFO);
