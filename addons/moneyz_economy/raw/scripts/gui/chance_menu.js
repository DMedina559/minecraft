import { ActionFormData } from "@minecraft/server-ui";
import { main } from "./moneyz_menu.js";
import { testYourLuck } from "../games/randomNum.js";
import { start21Game } from "../games/21Game.js";
import { startCrapsGame } from "../games/diceGame.js";
import { startSlotsGame } from "../games/slotGame.js";
import { log, LOG_LEVELS } from "../logger.js";

export function chanceMenu(player) {
  log(`${player.nameTag} entered Chance Menu`, LOG_LEVELS.DEBUG);
  const chanceMessage = `§l§oTake a chance!\nYou have a chance to win a multiplier of your stake amount!`;

  new ActionFormData()
    .title("§l§6Chance Menu")
    .body(chanceMessage)
    .button("§lTest Your Luck")
    .button("§l21")
    .button("§lDice Game")
    .button("§lSlots")
    .button("§lBack")
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
        main(player);
      }
    })
    .catch((error) => {
      log(`Error showing Chance Menu: ${error}`, LOG_LEVELS.ERROR);
    });
}
log("chance_menu.js loaded", LOG_LEVELS.DEBUG);
