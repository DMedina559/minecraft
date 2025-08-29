import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { getScore, updateScore, getRandomInt } from '../utilities.js';
import { chanceMenu } from "../gui/chance_menu.js";
import { log, LOG_LEVELS } from "../logger.js";

function getWorldProperty(key) {
    const property = world.getDynamicProperty(key);
    log(`Retrieved world property "${key}": ${property}`, LOG_LEVELS.DEBUG);
    return property;
};

export async function testYourLuck(player) {
    log(`Running "Test Your Luck" for ${player.nameTag}`, LOG_LEVELS.DEBUG);

    try {
        const playerScore = getScore("Moneyz", player);
        const winChance = getWorldProperty("chanceWin");
        const worldMultiplier = parseFloat(getWorldProperty("chanceX"));

        const modalForm = new ModalFormData()
            .title("Test Your Luck")
            .textField("Enter your stake amount:", "Enter amount here");

        const response = await modalForm.show(player);

        if (response.canceled) {
            log(`Player "${player.nameTag}" cancelled the Test Your Luck form.`, LOG_LEVELS.DEBUG);
            return;
        }

        const stakeAmount = parseInt(response.formValues[0], 10);

        if (isNaN(stakeAmount) || stakeAmount <= 0) {
            player.sendMessage("§cInvalid stake amount. Please enter a positive number.");
            log(`Player "${player.nameTag}" entered an invalid stake amount: ${response.formValues[0]}`, LOG_LEVELS.WARN);
            return;
        }

        if (stakeAmount > playerScore) {
            player.sendMessage("§cInvalid stake amount. You cannot stake more than your balance.");
            log(`Player "${player.nameTag}" tried to stake more than their balance. Stake: ${stakeAmount}, Balance: ${playerScore}`, LOG_LEVELS.WARN);
            return;
        }

        updateScore(player, stakeAmount, "remove");
        log(`Player "${player.nameTag}" is staking ${stakeAmount} Moneyz. Stake deducted.`, LOG_LEVELS.DEBUG);

        if (getRandomInt(1, 100) <= winChance) {
            const winAmount = Math.round(stakeAmount * worldMultiplier);
            updateScore(player, winAmount, "add");
            player.sendMessage(`§aYou won ${winAmount} Moneyz!`);
            player.playSound("random.levelup");
            log(`${player.nameTag} won ${winAmount} Moneyz.`, LOG_LEVELS.INFO);
        } else {
            player.sendMessage(`§cYou lost ${stakeAmount} Moneyz. Better luck next time!`);
            player.playSound("note.bass");
            log(`${player.nameTag} lost ${stakeAmount} Moneyz.`, LOG_LEVELS.INFO);
        }
    } catch (error) {
        log(`Error processing "Test Your Luck" for player "${player.nameTag}": ${error}`, LOG_LEVELS.ERROR, error.stack);
    }
};

log("randomNum.js loaded", LOG_LEVELS.DEBUG);
