import { world } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";
import { getScore, updateScore, getRandomInt } from "../utilities.js";
import { chanceMenu } from "../gui/chance_menu.js";
import { log, LOG_LEVELS } from "../logger.js";

const SLOT_ICONS = {
    "Cherry": "🍒 Cherry",
    "Lemon": "🍋 Lemon",
    "Orange": "🍊 Orange",
    "Plum": "🫐 Plum",
    "Bell": "🔔 Bell",
    "Bar": "🪙 Bar",
    "Seven": "🎰 Seven"
};

const slotSymbols = Object.keys(SLOT_ICONS);

function spinSlots(chanceWin) {
    const reels = [];
    for (let i = 0; i < 3; i++) {
        if (getRandomInt(1, 100) <= chanceWin) {
            const winSymbols = ["Bell", "Bar", "Seven"];
            reels.push(winSymbols[getRandomInt(0, winSymbols.length - 1)]);
        } else {
            reels.push(slotSymbols[getRandomInt(0, slotSymbols.length - 1)]);
        }
    }
    return reels;
}

async function playSlots(player, stake, isNpcInteraction) {
    const chanceWin = parseFloat(world.getDynamicProperty("chanceWin") || "50");
    const chanceX = parseFloat(world.getDynamicProperty("chanceX") || "2");

    const reels = spinSlots(chanceWin);
    let winnings = 0;
    let winType = "";

    if (reels[0] === reels[1] && reels[1] === reels[2]) {
        if (reels[0] === "Seven") {
            winnings = Math.round(stake * chanceX * 5);
            winType = "💥 JACKPOT! 💥";
        } else if (reels[0] === "Bar") {
            winnings = Math.round(stake * chanceX * 3);
            winType = "🌟 BIG WIN! 🌟";
        } else {
            winnings = Math.round(stake * chanceX);
            winType = "🎉 Three of a Kind! 🎉";
        }
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
        winnings = Math.round(stake * (chanceX / 2));
        winType = "✨ Two of a Kind! ✨";
    }

    if (winnings > 0) {
        try { player.playSound("random.levelup"); } catch {}
    } else {
        try { player.playSound("note.bass"); } catch {}
    }

    try {
        updateScore(player, winnings, "add");
        showSlotResults(player, stake, reels, winnings, winType, isNpcInteraction);
    } catch (error) {
        log(`Error updating slot winnings for ${player.nameTag}: ${error}`, LOG_LEVELS.ERROR);
        player.sendMessage("§cAn error occurred while updating your winnings.");
    }
}

function showSlotResults(player, stake, reels, winnings, winType, isNpcInteraction) {
    const displayReels = reels.map(r => SLOT_ICONS[r] || r).join(" | ");
    let message = `§l§6[ SLOT MACHINE RESULTS ]§r\n\n`;
    message += `[ ${displayReels} ]\n\n`;

    if (winnings > 0) {
        message += `§a${winType}\n§2You won ${winnings} Moneyz!`;
    } else {
        message += "§cBetter luck next time! You lost your stake.";
    }

    new ActionFormData()
        .title("§l§6Slot Machine")
        .body(message)
        .button("🎰 Spin Again")
        .button("§c§lBack to Menu")
        .show(player)
        .then(response => {
            if (!response || response.canceled) return;
            if (response.selection === 0) {
                startSlotsGame(player, isNpcInteraction);
            } else if (!isNpcInteraction) {
                chanceMenu(player);
            }
        });
}

export function startSlotsGame(player, isNpcInteraction) {
    new ModalFormData()
        .title("§l§6Slot Machine")
        .textField("Enter your stake:", "Enter stake amount here")
        .show(player)
        .then(response => {
            if (!response || response.canceled) return;

            const stake = parseInt(response.formValues[0], 10);
            if (isNaN(stake) || stake <= 0) {
                player.sendMessage("§cInvalid stake amount.");
                return;
            }

            try {
                const playerScore = getScore("Moneyz", player);
                if (playerScore < stake) {
                    player.sendMessage("§cYou don't have enough Moneyz!");
                    return;
                }
                updateScore(player, stake, "remove");
                playSlots(player, stake, isNpcInteraction);
            } catch (error) {
                log(`Error during slot stake validation for ${player.nameTag}: ${error}`, LOG_LEVELS.ERROR);
                player.sendMessage("§cAn error occurred while processing your stake.");
            }
        });
}

log("slotGame.js loaded", LOG_LEVELS.DEBUG);
