import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getRandomInt } from "../utilities.js";
import * as GameEconomy from "../services/game_economy.js";
import { chanceMenu } from "../gui/chance_menu.js";
import { log, LOG_LEVELS } from "../logger.js";
import * as Config from "../core/config.js";
import * as Economy from "../core/economy.js";

function rollDice() {
    const die1 = getRandomInt(1, 6);
    const die2 = getRandomInt(1, 6);
    return die1 + die2;
}

async function playCrapsPointLoop(player, stake, point, chanceWin, chanceX) {
    let message = `§ePoint is set to §l${point}§r§e. Roll again to hit the point, or 7 to lose!`;

    while (true) {
        const actionForm = new ActionFormData()
            .title("§l§6Craps - Roll for Point")
            .body(message)
            .button("Roll Dice");

        const rollResponse = await actionForm.show(player);
        if (rollResponse.canceled) return;

        const nextRoll = rollDice();

        if (nextRoll === point) {
            if (getRandomInt(1, 100) <= chanceWin) {
                const winnings = Math.round(stake * chanceX);
                GameEconomy.payout(player, winnings, "dice");
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
    const chanceWin = Config.number("chanceWin", 50);
    const chanceX = Config.number("chanceX", 2);

    const comeOutRoll = rollDice();

    if (comeOutRoll === 7 || comeOutRoll === 11) {
        if (getRandomInt(1, 100) <= chanceWin) {
            const winnings = Math.round(stake * chanceX);
            GameEconomy.payout(player, winnings, "dice");
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

export async function startCrapsGame(player, isNpcInteraction) {
    try {
        const modalForm = new ModalFormData()
            .title("§l§6Dice Game (Craps)")
            .textField("Enter your stake:", "Enter stake amount here");

        const response = await modalForm.show(player);
        if (response.canceled) {
            if (!isNpcInteraction) chanceMenu(player);
            return;
        }

        const stake = parseInt(response.formValues[0], 10);
        if (isNaN(stake) || stake <= 0) {
            player.sendMessage("§cInvalid stake amount.");
            if (!isNpcInteraction) chanceMenu(player);
            return;
        }

        const playerScore = Economy.getBalance(player);
        if (playerScore < stake) {
            player.sendMessage("§cYou don't have enough Moneyz!");
            if (!isNpcInteraction) chanceMenu(player);
            return;
        }

        GameEconomy.placeBet(player, stake, "dice");
        await playCraps(player, stake, isNpcInteraction);
    } catch (error) {
        log(`Error in Craps game: ${error}`, LOG_LEVELS.ERROR);
    }
}

log("diceGame.js loaded", LOG_LEVELS.DEBUG);
