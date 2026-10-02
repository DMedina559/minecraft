import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { getRandomInt } from "../utilities.js";
import * as GameEconomy from "../services/game_economy.js";
import { chanceMenu } from "../gui/chance_menu.js";
import { log, LOG_LEVELS } from "../logger.js";
import * as Config from "../core/config.js";
import * as Economy from "../core/economy.js";

export async function testYourLuck(player, isNpcInteraction) {
    try {
        const playerScore = Economy.getBalance(player);
        const winChance = Config.number("chanceWin", 50);
        const worldMultiplier = Config.number("chanceX", 2);

        const modalForm = new ModalFormData()
            .title("§l§6Test Your Luck")
            .textField("Enter your stake amount:", "Enter amount here");

        const response = await modalForm.show(player);

        if (response.canceled) {
            if (!isNpcInteraction) chanceMenu(player);
            return;
        }

        const stakeAmount = parseInt(response.formValues[0], 10);

        if (isNaN(stakeAmount) || stakeAmount <= 0) {
            player.sendMessage("§cInvalid stake amount. Please enter a positive number.");
            if (!isNpcInteraction) chanceMenu(player);
            return;
        }

        if (stakeAmount > playerScore) {
            player.sendMessage("§cInvalid stake amount. You cannot stake more than your balance.");
            if (!isNpcInteraction) chanceMenu(player);
            return;
        }

        GameEconomy.placeBet(player, stakeAmount, "random");

        if (getRandomInt(1, 100) <= winChance) {
            const winAmount = Math.round(stakeAmount * worldMultiplier);
            GameEconomy.payout(player, winAmount, "random");
            player.sendMessage(`§aYou won ${winAmount} Moneyz!`);
            try { player.playSound("random.levelup"); } catch {}
        } else {
            player.sendMessage(`§cYou lost ${stakeAmount} Moneyz. Better luck next time!`);
            try { player.playSound("note.bass"); } catch {}
        }

        if (!isNpcInteraction) chanceMenu(player);
    } catch (error) {
        log(`Error processing "Test Your Luck" for ${player.nameTag}: ${error}`, LOG_LEVELS.ERROR);
    }
}

log("randomNum.js loaded", LOG_LEVELS.DEBUG);
