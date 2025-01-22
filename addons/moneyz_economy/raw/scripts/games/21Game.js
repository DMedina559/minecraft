import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getScore, updateScore, getRandomInt } from "../utilities.js";
import { chanceMenu } from "../gui/chance_menu.js";
import { log, LOG_LEVELS } from "../logger.js";

const CARD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];

function getRandomCard() {
    return CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
}

function calculateHandValue(hand) {
    let sum = 0;
    let aces = 0;

    for (const card of hand) {
        sum += card;
        if (card === 1) aces++;
    }

    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }
    return sum;
}

function displayHand(hand) {
    return hand
        .map(card => (card === 1 ? "A" : card === 10 ? "10/J/Q/K" : card.toString()))
        .join(", ");
}

export async function start21Game(player, isNpcInteraction) {
    try {
        const modalForm = new ModalFormData()
            .title("§l§621 Game")
            .textField("Enter your stake:", "Enter stake amount here");

        const response = await modalForm.show(player);
        if (response.canceled && !isNpcInteraction) {
            chanceMenu(player);
            return;
        }

        const stake = parseInt(response.formValues[0], 10);
        if (isNaN(stake) || stake <= 0) {
            player.sendMessage("§cInvalid stake amount.");
            if (!isNpcInteraction) chanceMenu(player);
            return;
        }

        const playerScore = await getScore("Moneyz", player);
        if (playerScore < stake) {
            player.sendMessage("§cYou don't have enough Moneyz!");
            if (!isNpcInteraction) chanceMenu(player);
            return;
        }

        log(`${player.nameTag} starts a 21 game with a stake of ${stake}.`, LOG_LEVELS.INFO);
        await updateScore(player, stake, "remove");
        await startGameRound(player, stake);
    } catch (error) {
        log(`Error starting 21 game: ${error}`, LOG_LEVELS.ERROR);
    }
}

async function startGameRound(player, stake) {
    try {
        const playerHand = [getRandomCard(), getRandomCard()];
        const dealerHand = [getRandomCard(), getRandomCard()];
        const chanceX = world.getDynamicProperty("chanceX") || 1;

        log(`Initial hands - Player: ${displayHand(playerHand)}; Dealer: ${displayHand([dealerHand[0]])} (showing only the first card).`, LOG_LEVELS.DEBUG);

        await continue21Game(player, stake, playerHand, dealerHand, chanceX);
    } catch (error) {
        log(`Error in game round: ${error}`, LOG_LEVELS.ERROR);
    }
}

async function continue21Game(player, stake, playerHand, dealerHand, chanceX) {
    try {
        const playerValue = calculateHandValue(playerHand);
        const dealerFirstCard = dealerHand[0];

        let message = `Your hand: ${displayHand(playerHand)} (${playerValue})\nDealer's showing card: ${displayHand([dealerFirstCard])}\n`;

        if (playerValue === 21) {
            await endGame(player, stake, playerHand, dealerHand, chanceX, "§aBlackjack!");
            return;
        }

        if (playerValue > 21) {
            await endGame(player, stake, playerHand, dealerHand, chanceX, "§cYou busted!");
            return;
        }

        const actionForm = new ActionFormData()
            .title("21 Game - Hit or Stand?")
            .body(message)
            .button("Hit")
            .button("Stand");

        const response = await actionForm.show(player);
        if (response.canceled) return;

        if (response.selection === 0) {
            playerHand.push(getRandomCard());
            log(`${player.nameTag} hits. New hand: ${displayHand(playerHand)} (Value: ${calculateHandValue(playerHand)})`, LOG_LEVELS.DEBUG);
            await continue21Game(player, stake, playerHand, dealerHand, chanceX);
        } else {
            log(`${player.nameTag} stands.`, LOG_LEVELS.DEBUG);
            await dealerTurn(player, stake, playerHand, dealerHand, chanceX);
        }
    } catch (error) {
        log(`Error in game continuation: ${error}`, LOG_LEVELS.ERROR);
    }
}

async function dealerTurn(player, stake, playerHand, dealerHand, chanceX) {
    try {
        const playerValue = calculateHandValue(playerHand);
        const chanceWin = world.getDynamicProperty("chanceWin") || 50;

        while (calculateHandValue(dealerHand) < 17) {
            const dealerValue = calculateHandValue(dealerHand);

            const shouldStop = getRandomInt(1, 100) <= chanceWin;
            if (shouldStop && dealerValue < playerValue) {
                log(`Dealer stops hitting due to chanceWin (${chanceWin}%).`, LOG_LEVELS.DEBUG);
                break;
            }

            dealerHand.push(getRandomCard());
            log(`Dealer hits. New hand: ${displayHand(dealerHand)} (Value: ${calculateHandValue(dealerHand)})`, LOG_LEVELS.DEBUG);
        }

        const dealerValue = calculateHandValue(dealerHand);
        const playerWins = 
            playerValue <= 21 && (dealerValue > 21 || playerValue > dealerValue);

        const forcedWin = !playerWins && getRandomInt(1, 100) <= chanceWin;

        if (forcedWin) {
            log(`Player forced to win due to chanceWin (${chanceWin}%).`, LOG_LEVELS.DEBUG);
        }

        await endGame(player, stake, playerHand, dealerHand, chanceX, playerWins || forcedWin ? "§aYou win!" : "§cYou lose!");
    } catch (error) {
        log(`Error during dealer turn: ${error}`, LOG_LEVELS.ERROR);
    }
}

async function endGame(player, stake, playerHand, dealerHand, chanceX, winMessage = "") {
    try {
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);
        let message = `Your hand: ${displayHand(playerHand)} (${playerValue})\nDealer's hand: ${displayHand(dealerHand)} (${dealerValue})\n`;

        log(`Final hands - Player: ${displayHand(playerHand)} (Value: ${playerValue}); Dealer: ${displayHand(dealerHand)} (Value: ${dealerValue})`, LOG_LEVELS.DEBUG);

        if (winMessage) message += winMessage + "\n";

        if (winMessage.includes("win")) {
            const winnings = Math.round(stake * chanceX);
            await updateScore(player, winnings, "add");
            message += `§aYou win ${winnings} Moneyz!`;
            player.runCommandAsync("playsound random.levelup @s ~ ~ ~");
        } else {
            message += "§cYou lose!";
            player.runCommandAsync("playsound note.bassattack @s ~ ~ ~");
        }

        player.sendMessage(message);
        system.run(() => chanceMenu(player));
    } catch (error) {
        log(`Error in game end: ${error}`, LOG_LEVELS.ERROR);
    }
}

log("21 Game module loaded", LOG_LEVELS.DEBUG);