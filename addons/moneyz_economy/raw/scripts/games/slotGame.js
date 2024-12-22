import { world } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";
import { getScore, updateScore, getRandomInt } from '../utilities.js';
import { chanceMenu } from '../gui/chance_menu.js';
import { log, LOG_LEVELS } from '../logger.js';

const slotSymbols = ["Cherry", "Lemon", "Orange", "Plum", "Bell", "Bar", "Seven"];

function spinSlots(chanceWin) {
    let reels = [];
    for (let i = 0; i < 3; i++) {
        if (getRandomInt(1, 100) <= chanceWin) {
            const winSymbols = ["Bell", "Bar", "Seven"];
            reels.push(winSymbols[getRandomInt(0, winSymbols.length - 1)]);
        } else {
            reels.push(slotSymbols[getRandomInt(0, slotSymbols.length - 1)]);
        }
    }
    return reels;
};

function playSlots(player, stake) {
    const chanceWin = world.getDynamicProperty("chanceWin");
    const chanceX = parseFloat(world.getDynamicProperty("chanceX"));

    const reels = spinSlots(chanceWin);
    let winnings = 0;
    let winType = "";

    if (reels[0] === reels[1] && reels[1] === reels[2]) {
        if (reels[0] === "Seven") {
            winnings = stake * chanceX * 5;
            winType = "JACKPOT!";
        } else if (reels[0] === "Bar") {
            winnings = stake * chanceX * 3;
            winType = "Big Win!";
        } else {
            winnings = stake * chanceX;
            winType = "Three of a kind!";
        }
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
        winnings = stake * (chanceX / 2);
        winType = "Two of a kind!";
    }

    if (winnings > 0) {
        log(`${player.nameTag} won ${winnings} Moneyz on the slots.`, LOG_LEVELS.INFO);
        player.runCommandAsync("playsound random.levelup @s ~ ~ ~");
    } else {
        log(`${player.nameTag} lost ${stake} Moneyz on the slots.`, LOG_LEVELS.INFO);
        player.runCommandAsync("playsound note.bassattack @s ~ ~ ~");
    }
    updateScore(player, winnings, "add");
    showSlotResults(player, stake, reels, winnings, winType);
};

function showSlotResults(player, stake, reels, winnings, winType) {
    let message = `§l§6[RESULTS]§r\n`;
    message += `[ ${reels.join(" | ")} ]\n`;

    if (winnings > 0) {
        message += `§a${winType} You win ${winnings} Moneyz!`;
    } else {
        message += "§cYou lose!";
    }

    new ActionFormData()
        .title("§l§6Slot Results")
        .body(message)
        .button("Spin Again")
        .button("Back to Menu")
        .show(player)
        .then(response => {
            if (response.selection === 0) {
                startSlotsGame(player);
            } else {
                chanceMenu(player);
            }
        });
};

export function startSlotsGame(player) {
    new ModalFormData()
        .title("§l§6Slot Machine")
        .textField("Enter your stake:", "Enter stake amount here")
        .show(player)
        .then(response => {
            if (response.canceled) return;

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
            updateScore(player, stake, "remove");
            playSlots(player, stake);
        });
};

log("slotGame.js loaded", LOG_LEVELS.DEBUG);