import { world } from "@minecraft/server";
import { ActionFormData } from "../ui/forms.js";
import { luckyMenu } from "./lucky_menu.js";
import { testYourLuck } from "../games/randomNum.js";
import { start21Game } from "../games/21Game.js";
import { startCrapsGame } from "../games/diceGame.js";
import { startSlotsGame } from "../games/slotGame.js";
import { log, LOG_LEVELS } from "../logger.js";
import * as Config from "../core/config.js";

export function chanceMenu(player) {
    if (!player) return;

    const chanceX = Config.get("chanceX", "2");
    const chanceMessage = `§l§oTake a chance!\nYou have a chance to win:\n§g§l${chanceX}x §ryour stake amount!`;

    new ActionFormData()
        .title("§l§1Chance Games")
        .body(chanceMessage)
        .button("§d§lTest Your Luck")
        .button("§d§l21")
        .button("§d§lDice Game")
        .button("§d§lSlots")
        .button("§c§lBack")
        .show(player)
        .then(response => {
            if (!response || response.canceled) return;
            switch (response.selection) {
                case 0: testYourLuck(player); break;
                case 1: start21Game(player); break;
                case 2: startCrapsGame(player); break;
                case 3: startSlotsGame(player); break;
                case 4: luckyMenu(player); break;
            }
        })
        .catch(error => {
            log(`Error showing Chance Menu: ${error}`, LOG_LEVELS.ERROR);
        });
}

log("chance_menu.js loaded", LOG_LEVELS.DEBUG);
