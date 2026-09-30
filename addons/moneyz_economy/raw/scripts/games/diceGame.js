import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getScore, updateScore, getRandomInt } from "../utilities.js";
import { log, LOG_LEVELS } from "../logger.js";

function rollDice() {
    const die1 = getRandomInt(1, 6);
    const die2 = getRandomInt(1, 6);
    return die1 + die2;
}

async function playCrapsPointLoop(player, stake, point, chanceWin, chanceX) {
    let message = `§ePoint is set to §l${point}§r§e. Roll again to hit the point, or 7 to lose!`;

    while (true) {
        const actionForm = new ActionFormData()
            .title("🎲 Craps - Roll for Point")
            .body(message)
            .button("🎲 Roll Dice");

        const rollResponse = await actionForm.show(player);
        if (rollResponse.canceled) return;

        const nextRoll = rollDice();

        if (nextRoll === point) {
            if (getRandomInt(1, 100) <= chanceWin) {
                const winnings = Math.round(stake * chanceX);
                updateScore(player, winnings, "add");
                try { player.playSound("random.levelup"); } catch {}
                player.sendMessage(`§aYou rolled a ${nextRoll}! Hit the Point! You win ${winnings} Moneyz!`);
            } else {
                try { player.playSound("note.bass"); } catch {}
                player.sendMessage(`§cYou rolled a ${nextRoll} (Hit Point - Chance Fail). You lose!`);
            }
            break;
        } else if (nextRoll === 7) {
            try { player.playSound("note.bass"); } catch {}
            player.sendMessage(`§cYou rolled a 7 (Seven Out)! You lose your stake.`);
            break;
        } else {
            message = `§eYou rolled a §l${nextRoll}§r§e. Point is still §l${point}§r§e. Roll again!`;
        }
    }
}

async function playCraps(player, stake) {
    const chanceWin = parseFloat(world.getDynamicProperty("chanceWin") || "50");
    const chanceX = parseFloat(world.getDynamicProperty("chanceX") || "2");

    const comeOutRoll = rollDice();

    if (comeOutRoll === 7 || comeOutRoll === 11) {
        if (getRandomInt(1, 100) <= chanceWin) {
            const winnings = Math.round(stake * chanceX);
            updateScore(player, winnings, "add");
            try { player.playSound("random.levelup"); } catch {}
            player.sendMessage(`§aCome-out roll: ${comeOutRoll}! Natural Win! You win ${winnings} Moneyz!`);
        } else {
            try { player.playSound("note.bass"); } catch {}
            player.sendMessage(`§cCome-out roll: ${comeOutRoll}! Natural Win - Chance Fail. You lose!`);
        }
    } else if (comeOutRoll === 2 || comeOutRoll === 3 || comeOutRoll === 12) {
        try { player.playSound("note.bass"); } catch {}
        player.sendMessage(`§cCome-out roll: ${comeOutRoll}! Craps! You lose!`);
    } else {
        const point = comeOutRoll;
        player.sendMessage(`§eCome-out roll: ${point}! Point established at ${point}.`);
        await playCrapsPointLoop(player, stake, point, chanceWin, chanceX);
    }
}

export async function startCrapsGame(player) {
    try {
        const modalForm = new ModalFormData()
            .title("§l§6Dice Game (Craps)")
            .textField("Enter your stake:", "Enter stake amount here");

        const response = await modalForm.show(player);
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
        await playCraps(player, stake);
    } catch (error) {
        log(`Error in Craps game: ${error}`, LOG_LEVELS.ERROR);
    }
}

log("diceGame.js loaded", LOG_LEVELS.DEBUG);
