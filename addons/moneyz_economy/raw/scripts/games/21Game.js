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

        const playerScore = getScore("Moneyz", player);
        if (playerScore < stake) {
            player.sendMessage("§cYou don't have enough Moneyz!");
            if (!isNpcInteraction) chanceMenu(player);
            return;
        }

        updateScore(player, stake, "remove");
        await startGameRound(player, stake, isNpcInteraction);
    } catch (error) {
        log(`Error starting 21 game: ${error}`, LOG_LEVELS.ERROR);
    }
}

async function startGameRound(player, stake, isNpcInteraction) {
    const playerHand = [getRandomCard(), getRandomCard()];
    const dealerHand = [getRandomCard(), getRandomCard()];
    const chanceX = parseFloat(world.getDynamicProperty("chanceX") || "1");

    await continue21Game(player, stake, playerHand, dealerHand, chanceX, isNpcInteraction);
}

async function continue21Game(player, stake, playerHand, dealerHand, chanceX, isNpcInteraction) {
    const playerValue = calculateHandValue(playerHand);
    const dealerFirstCard = dealerHand[0];

    const message = `Your hand: ${displayHand(playerHand)} (${playerValue})\nDealer's showing card: ${displayHand([dealerFirstCard])}\n`;

    if (playerValue === 21) {
        await endGame(player, stake, playerHand, dealerHand, chanceX, "§aBlackjack!", isNpcInteraction);
        return;
    }

    if (playerValue > 21) {
        await endGame(player, stake, playerHand, dealerHand, chanceX, "§cYou busted!", isNpcInteraction);
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
        await continue21Game(player, stake, playerHand, dealerHand, chanceX, isNpcInteraction);
    } else {
        await dealerTurn(player, stake, playerHand, dealerHand, chanceX, isNpcInteraction);
    }
}

async function dealerTurn(player, stake, playerHand, dealerHand, chanceX, isNpcInteraction) {
    const playerValue = calculateHandValue(playerHand);
    const chanceWin = parseFloat(world.getDynamicProperty("chanceWin") || "50");

    while (calculateHandValue(dealerHand) < 17) {
        const dealerValue = calculateHandValue(dealerHand);
        const shouldStop = getRandomInt(1, 100) <= chanceWin;
        if (shouldStop && dealerValue < playerValue) break;

        dealerHand.push(getRandomCard());
    }

    const dealerValue = calculateHandValue(dealerHand);
    const playerWins = playerValue <= 21 && (dealerValue > 21 || playerValue > dealerValue);
    const forcedWin = !playerWins && getRandomInt(1, 100) <= chanceWin;

    await endGame(player, stake, playerHand, dealerHand, chanceX, (playerWins || forcedWin) ? "§aYou win!" : "§cYou lose!", isNpcInteraction);
}

async function endGame(player, stake, playerHand, dealerHand, chanceX, winMessage = "", isNpcInteraction = false) {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    let message = `Your hand: ${displayHand(playerHand)} (${playerValue})\nDealer's hand: ${displayHand(dealerHand)} (${dealerValue})\n`;

    if (winMessage) message += winMessage + "\n";

    if (winMessage.includes("win")) {
        const winnings = Math.round(stake * chanceX);
        updateScore(player, winnings, "add");
        message += `§aYou win ${winnings} Moneyz!`;
        try { player.playSound("random.levelup"); } catch {}
    } else {
        try { player.playSound("note.bass"); } catch {}
    }

    player.sendMessage(message);
    if (!isNpcInteraction) {
        system.run(() => chanceMenu(player));
    }
}

log("21 Game module loaded", LOG_LEVELS.DEBUG);
