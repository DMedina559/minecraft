import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getScore, updateScore, getRandomInt } from '../utilities.js';
import { chanceMenu } from '../gui/chance_menu.js';
import { log, LOG_LEVELS } from '../logger.js';

const CARD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10];
const ACE_HIGH = 11;
const ACE_LOW = 1;

function getRandomCard() {
    return CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
};

function calculateHandValue(hand) {
    let sum = 0;
    let aces = 0;

    for (const card of hand) {
        sum += card;
        if (card === 1) {
            aces++;
        }
    }

    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }
    return sum;
};

function displayHand(hand) {
    return hand.map(card => {
        switch (card) {
            case 1: return "A";
            case 11: return "A";
            case 10: return "10/J/Q/K";
            default: return card.toString();
        }
    }).join(", ");
};

export function start21Game(player) {
    new ModalFormData()
        .title("§l§621 Game")
        .textField("Enter your stake:", "Enter stake amount here")
        .show(player)
        .then(response => {
            if (response.canceled) {
                chanceMenu(player);
                return;
            }

            const stake = parseInt(response.formValues[0], 10);
            if (isNaN(stake) || stake <= 0) {
                player.sendMessage("§cInvalid stake amount.");
                chanceMenu(player);
                return;
            }

            const playerScore = getScore("Moneyz", player);
            if (playerScore < stake) {
                player.sendMessage("§cYou don't have enough Moneyz!");
                chanceMenu(player);
                return;
            }
            log(`${player.nameTag} starts a 21 game with a stake of ${stake}.`, LOG_LEVELS.INFO);
            startGameRound(player, stake);
        });
};

function startGameRound(player, stake) {
    let playerHand = [];
    let dealerHand = [];
    const chanceX = world.getDynamicProperty("chanceX") || 1;

    playerHand.push(getRandomCard());
    dealerHand.push(getRandomCard());
    playerHand.push(getRandomCard());
    dealerHand.push(getRandomCard());

    log(`Initial hands - Player: ${displayHand(playerHand)}; Dealer: ${displayHand([dealerHand[0]])} (showing only the first card).`, LOG_LEVELS.DEBUG);

    updateScore(player, stake, "remove");

    continue21Game(player, stake, playerHand, dealerHand, chanceX);
};

function continue21Game(player, stake, playerHand, dealerHand, chanceX) {
    const playerValue = calculateHandValue(playerHand);
    const dealerFirstCard = dealerHand[0];
    const dealerValue = calculateHandValue(dealerHand);
    const winChance = world.getDynamicProperty("chanceWin") || 50; // Default to 50%

    let message = `Your hand: ${displayHand(playerHand)} (${playerValue})\nDealer's showing card: ${displayHand([dealerFirstCard])}\n`;
    log(`Player's hand: ${displayHand(playerHand)} (Value: ${playerValue})`, LOG_LEVELS.DEBUG);
    log(`Dealer showing: ${displayHand([dealerFirstCard])} (Value: ${calculateHandValue([dealerFirstCard])})`, LOG_LEVELS.DEBUG);

    if (playerValue === 21) {
        endGame(player, stake, playerHand, dealerHand, true, chanceX);
        return;
    }

    if (playerValue > 21) {
        endGame(player, stake, playerHand, dealerHand, false, chanceX);
        return;
    }

    new ActionFormData()
        .title("21 Game - Hit or Stand?")
        .body(message)
        .button("Hit")
        .button("Stand")
        .show(player)
        .then(response => {
            if (response.canceled) return;

            if (response.selection === 0) {
                playerHand.push(getRandomCard());
                log(`${player.nameTag} hits. New hand: ${displayHand(playerHand)} (Value: ${calculateHandValue(playerHand)})`, LOG_LEVELS.DEBUG);
                continue21Game(player, stake, playerHand, dealerHand, chanceX);
            } else {
                log(`${player.nameTag} stands.`, LOG_LEVELS.DEBUG);
                while (calculateHandValue(dealerHand) < 17) {
                    if (getRandomInt(1, 100) <= winChance) {
                        log(`Dealer stands. Dealer hand: ${displayHand(dealerHand)} (Value: ${calculateHandValue(dealerHand)})`, LOG_LEVELS.DEBUG);
                        break;
                    }
                    dealerHand.push(getRandomCard());
                     log(`Dealer hits. New hand: ${displayHand(dealerHand)} (Value: ${calculateHandValue(dealerHand)})`, LOG_LEVELS.DEBUG);
                }

                const playerWon = calculateHandValue(playerHand) <= 21 &&
                    (calculateHandValue(dealerHand) > 21 || calculateHandValue(playerHand) > calculateHandValue(dealerHand));

                endGame(player, stake, playerHand, dealerHand, playerWon, chanceX);
            }
        });
};

function endGame(player, stake, playerHand, dealerHand, chanceX, winMessage = "") {
  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);
  let message = `Your hand: ${displayHand(playerHand)} (${playerValue})\nDealer's hand: ${displayHand(dealerHand)} (${dealerValue})\n`;
  const winChance = world.getDynamicProperty("chanceWin") || 0;

  log(`Final hands - Player: ${displayHand(playerHand)} (Value: ${playerValue}); Dealer: ${displayHand(dealerHand)} (Value: ${dealerValue})`, LOG_LEVELS.DEBUG);

  if (winMessage) message += winMessage + "\n";

  let winnings = 0;
  
  if (getRandomInt(1, 100) <= winChance) {
    winnings = stake * chanceX;
    log(`Calculating winnings: stake = ${stake}, chanceX = ${chanceX}, winnings = ${winnings}`, LOG_LEVELS.DEBUG);
    updateScore(player, winnings, "add");
    message += `§aYou win ${winnings} Moneyz!`;
    player.runCommandAsync("playsound random.levelup @s ~ ~ ~");
  } else {
    log(`Chance Win Fail`, LOG_LEVELS.DEBUG);
    message += "§cYou lose!";
    player.runCommandAsync("playsound note.bassattack @s ~ ~ ~");
  }

  player.sendMessage(message);
  system.run(() => chanceMenu(player));
};

log("randomNum.js loaded", LOG_LEVELS.DEBUG);