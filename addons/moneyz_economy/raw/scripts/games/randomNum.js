import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { getScore, updateScore, getRandomInt } from "../utilities.js";
import { chanceMenu } from "../gui/chance_menu.js";
import { log, LOG_LEVELS } from "../logger.js";

export async function testYourLuck(player) {
    try {
        const playerScore = getScore("Moneyz", player);
        const winChance = parseFloat(world.getDynamicProperty("chanceWin") || "50");
        const worldMultiplier = parseFloat(world.getDynamicProperty("chanceX") || "2");

        const modalForm = new ModalFormData()
            .title("Test Your Luck")
            .textField("Enter your stake amount:", "Enter amount here");

        const response = await modalForm.show(player);

        if (response.canceled) return;

        const stakeAmount = parseInt(response.formValues[0], 10);

        if (isNaN(stakeAmount) || stakeAmount <= 0) {
            player.sendMessage("§cInvalid stake amount. Please enter a positive number.");
            return;
        }

        if (stakeAmount > playerScore) {
            player.sendMessage("§cInvalid stake amount. You cannot stake more than your balance.");
            return;
        }

        updateScore(player, stakeAmount, "remove");

        if (getRandomInt(1, 100) <= winChance) {
            const winAmount = Math.round(stakeAmount * worldMultiplier);
            updateScore(player, winAmount, "add");
            player.sendMessage(`§aYou won ${winAmount} Moneyz!`);
            try { player.playSound("random.levelup"); } catch {}
        } else {
            player.sendMessage(`§cYou lost ${stakeAmount} Moneyz. Better luck next time!`);
            try { player.playSound("note.bass"); } catch {}
        }
    } catch (error) {
        log(`Error processing "Test Your Luck" for ${player.nameTag}: ${error}`, LOG_LEVELS.ERROR);
    }
}

log("randomNum.js loaded", LOG_LEVELS.DEBUG);
