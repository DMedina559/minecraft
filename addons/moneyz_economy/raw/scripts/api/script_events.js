import { system } from "@minecraft/server";
import { reloadShops } from "../repositories/shops.js";
import { log, LOG_LEVELS } from "../logger.js";

export function initializeScriptEvents() {
    system.afterEvents.scriptEventReceive.subscribe(event => {
        if (!event.id?.startsWith("moneyz:")) return;
        switch (event.id) {
            case "moneyz:reload":
            case "moneyz:shop/reload": reloadShops(); break;
            default: log(`Ignored unknown script event ${event.id}`, LOG_LEVELS.DEBUG);
        }
    });
}
