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

export function testYourLuck(player) {
    log(`Running "Test Your Luck" for ${player.nameTag}`, LOG_LEVELS.DEBUG);

    try {
        const scoreData = getScore("Moneyz", player);

        if (!scoreData) {
            player.sendMessage(`§cYou do not have any Moneyz.`);
            log(`Player "${player.nameTag}" has no Moneyz score.`, LOG_LEVELS.WARN);
            return;
        }

        const playerScore = scoreData.score;
        const winChance = world.getDynamicProperty("chanceWin") || 0;
        const worldMultiplier = world.getDynamicProperty("chanceX") || 0;

        const modalForm = new ModalFormData()
            .title("Test Your Luck")
            .textField("Enter your stake amount:", "Enter amount here");

        modalForm.show(player).then(response => {
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
                const winAmount = stakeAmount * worldMultiplier;
                updateScore(player, winAmount, "add");
                player.sendMessage(`§aYou won ${winAmount} Moneyz!`);
                player.runCommandAsync("playsound random.levelup @s ~ ~ ~");
                log(`${player.nameTag} won ${winAmount} Moneyz.`, LOG_LEVELS.INFO);
            } else {
                player.sendMessage(`§cYou lost ${stakeAmount} Moneyz. Better luck next time!`);
                player.runCommandAsync("playsound note.bassattack @s ~ ~ ~");
                log(`${player.nameTag} lost ${stakeAmount} Moneyz.`, LOG_LEVELS.INFO);
            }
        }).catch(error => {
            log(`Error showing Test Your Luck form: ${error}`, LOG_LEVELS.ERROR);
        });
    } catch (error) {
        log(`Error processing "Test Your Luck" for player "${player.nameTag}": ${error}`, LOG_LEVELS.ERROR);
    }
};

log("randomNum.js loaded", LOG_LEVELS.DEBUG);