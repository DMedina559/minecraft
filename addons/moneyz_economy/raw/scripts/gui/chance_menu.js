import { world } from "@minecraft/server"
import { ActionFormData } from "@minecraft/server-ui";
import { luckyMenu } from "./lucky_menu.js";
import { testYourLuck } from "../games/randomNum.js";
import { start21Game } from "../games/21Game.js";
import { startCrapsGame } from "../games/diceGame.js";
import { startSlotsGame } from "../games/slotGame.js";
import { log, LOG_LEVELS } from "../logger.js";

export function chanceMenu(player) {
  log(`${player.nameTag} entered Chance Menu`, LOG_LEVELS.DEBUG);
  
  const chanceX = world.getDynamicProperty("chanceX");
  const chanceMessage = `§l§oTake a chance!\nYou have a chance to win:\n§g§l${chanceX}x §ryour stake amount!`;


  new ActionFormData()
    .title("§l§1Chance Games")
    .body(chanceMessage)
    .button("§d§lTest Your Luck")
    .button("§d§l21")
    .button("§d§lDice Game")
    .button("§d§lSlots")
    .button("§4§lBack")
    .show(player)
    .then((response) => {
      if (response.selection === 0) {
        testYourLuck(player);
      } else if (response.selection === 1) {
        start21Game(player);
      } else if (response.selection === 2) {
        startCrapsGame(player);
      } else if (response.selection === 3) {
        startSlotsGame(player);
      } else if (response.selection === 4) {
        luckyMenu(player);
      }
    })
    .catch((error) => {
      log(`Error showing Chance Menu: ${error}`, LOG_LEVELS.ERROR);
    });
}

log("chance_menu.js loaded", LOG_LEVELS.DEBUG);
