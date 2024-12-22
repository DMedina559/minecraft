import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getScore, updateScore, getRandomInt } from '../utilities.js';
import { chanceMenu } from '../gui/chance_menu.js';
import { log, LOG_LEVELS } from '../logger.js';

function rollDice() {
    const die1 = getRandomInt(1, 6);
    const die2 = getRandomInt(1, 6);
    const sum = die1 + die2;
    log(`Dice rolled: ${die1} + ${die2} = ${sum}`, LOG_LEVELS.DEBUG);
    return sum;
};

function playCraps(player, stake) {
    const chanceWin = world.getDynamicProperty("chanceWin");
    const chanceX = parseFloat(world.getDynamicProperty("chanceX"));

    const comeOutRoll = rollDice();
    let message = `You rolled: ${comeOutRoll}\n`;

    if (comeOutRoll === 7 || comeOutRoll === 11) {
        if (getRandomInt(1, 100) <= chanceWin) {
            const winnings = stake * chanceX;
            updateScore(player, winnings, "add");
            message += `§aYou win ${winnings} Moneyz! (Natural)`;
            log(`${player.nameTag} won ${winnings} Moneyz (Natural).`, LOG_LEVELS.INFO);
            player.runCommandAsync("playsound random.levelup @s ~ ~ ~");
        } else {
            message += "§cYou lose! (Natural - Chance Fail)";
            log(`${player.nameTag} lost ${stake} Moneyz (Natural - Chance Fail).`, LOG_LEVELS.INFO);
            player.runCommandAsync("playsound note.bassattack @s ~ ~ ~");
        }
        player.sendMessage(message);
        return;
    } else if (comeOutRoll === 2 || comeOutRoll === 3 || comeOutRoll === 12) {
        message += "§cYou lose! (Craps)";
        log(`${player.nameTag} lost ${stake} Moneyz (Craps).`, LOG_LEVELS.INFO);
        player.runCommandAsync("playsound note.bassattack @s ~ ~ ~");
        player.sendMessage(message);
        return;
    } else {
        const point = comeOutRoll;
        message += `Point is now ${point}\n`;
        log(`Point established: ${point}`, LOG_LEVELS.DEBUG);

        new ActionFormData()
            .title("Craps - Roll for Point")
            .body(message + "Roll again to match the point, or 7 to lose.")
            .button("Roll")
            .show(player)
            .then(rollResponse => {
                if (rollResponse.canceled) return;

                const nextRoll = rollDice();
                message += `You rolled: ${nextRoll}\n`;

                if (nextRoll === point) {
                    if (getRandomInt(1, 100) <= chanceWin) {
                        const winnings = stake * chanceX;
                        updateScore(player, winnings, "add");
                        message += `§aYou win ${winnings} Moneyz! (Hit the Point)`;
                        log(`${player.nameTag} won ${winnings} Moneyz (Hit the Point).`, LOG_LEVELS.INFO);
                        player.runCommandAsync("playsound random.levelup @s ~ ~ ~");
                    } else { //Chance of LOSING
                        message += "§cYou lose! (Hit the Point - Chance Fail)";
                        log(`${player.nameTag} lost ${stake} Moneyz (Hit the Point - Chance Fail).`, LOG_LEVELS.INFO);
                        player.runCommandAsync("playsound note.bassattack @s ~ ~ ~");
                    }
                } else if (nextRoll === 7) {
                    message += "§cYou lose! (Seven Out)";
                    log(`${player.nameTag} lost ${stake} Moneyz (Seven Out).`, LOG_LEVELS.INFO);
                    player.runCommandAsync("playsound note.bassattack @s ~ ~ ~");
                } else {
                    message += "Roll again!";
                    log(`Rolled ${nextRoll}, still trying for point ${point}`, LOG_LEVELS.DEBUG);
                    playCraps(player, stake);
                    return;
                }
                player.sendMessage(message);
            });
    }
};

export function startCrapsGame(player) {
    new ModalFormData()
        .title("§l§6Dice Game")
        .textField("Enter your stake:", "Enter stake amount here")
        .show(player)
        .then(response => {
            if (response.canceled) {
                return;
            }

            const stake = parseInt(response.formValues[0], 10);
            if (isNaN(stake) || stake <= 0) {
                player.sendMessage("§cInvalid stake amount.");
                return;
            }

            const playerScore = getScore("Moneyz", player);
            if (playerScore < stake) {
                player.sendMessage("§cYou don't have enough Moneyz!");
                return;
            }
            updateScore(player, stake, "remove")
            playCraps(player, stake);
        });
};

log("diceGame.js loaded", LOG_LEVELS.DEBUG);