import { system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "../ui/forms.js";
import * as GameEconomy from "../services/game_economy.js";
import { chanceMenu } from "../gui/chance_menu.js";
import { log, LOG_LEVELS } from "../logger.js";
import * as Config from "../core/config.js";

// Aces start at 11 and are reduced to 1 only when required.
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const valueOf = rank => rank === "A" ? 11 : ["J", "Q", "K"].includes(rank) ? 10 : Number(rank);
const drawCard = () => RANKS[Math.floor(Math.random() * RANKS.length)];

function handValue(hand) {
    let total = hand.reduce((sum, rank) => sum + valueOf(rank), 0);
    let aces = hand.filter(rank => rank === "A").length;
    while (total > 21 && aces-- > 0) total -= 10;
    return total;
}

const handText = hand => `${hand.join(", ")} (${handValue(hand)})`;
const isNatural = hand => hand.length === 2 && handValue(hand) === 21;

function returnToMenu(player, isNpcInteraction) {
    if (!isNpcInteraction) system.run(() => chanceMenu(player));
}

async function finish(player, stake, playerHand, dealerHand, outcome, isNpcInteraction) {
    const multiplier = Math.max(1, Config.number("chanceX", 2));
    let result;
    if (outcome === "win" || outcome === "blackjack") {
        const payout = Math.round(stake * multiplier);
        GameEconomy.payout(player, payout, "21", { outcome });
        result = `§a${outcome === "blackjack" ? "Blackjack!" : "You win!"} §e+${payout} Moneyz`;
        try { player.playSound("random.levelup"); } catch {}
    } else if (outcome === "push") {
        GameEconomy.push(player, stake, "21", { outcome });
        result = "§ePush. Your stake was returned.";
    } else {
        result = `§cYou lose ${stake} Moneyz.`;
        try { player.playSound("note.bass"); } catch {}
    }

    await new ActionFormData()
        .title("§l§621 Game")
        .body(`§lYour hand§r\n${handText(playerHand)}\n\n§lDealer hand§r\n${handText(dealerHand)}\n\n${result}`)
        .button("Play Again")
        .button("Back")
        .show(player)
        .then(r => {
            if (!r || r.canceled) return;
            if (r.selection === 0) system.run(() => start21Game(player, isNpcInteraction));
            else returnToMenu(player, isNpcInteraction);
        });
}

async function playRound(player, stake, isNpcInteraction) {
    const playerHand = [drawCard(), drawCard()];
    const dealerHand = [drawCard(), drawCard()];

    if (isNatural(playerHand) || isNatural(dealerHand)) {
        const outcome = isNatural(playerHand) && isNatural(dealerHand) ? "push" : isNatural(playerHand) ? "blackjack" : "lose";
        return finish(player, stake, playerHand, dealerHand, outcome, isNpcInteraction);
    }

    while (handValue(playerHand) < 21) {
        const response = await new ActionFormData()
            .title("§l§621 Game")
            .body(`§lYour hand§r\n${handText(playerHand)}\n\n§lDealer shows§r\n${dealerHand[0]}`)
            .button("Hit")
            .button("Stand")
            .show(player);
        if (!response || response.canceled) return; // closing after a placed bet forfeits the round
        if (response.selection === 1) break;
        playerHand.push(drawCard());
    }

    if (handValue(playerHand) > 21) return finish(player, stake, playerHand, dealerHand, "lose", isNpcInteraction);
    while (handValue(dealerHand) < 17) dealerHand.push(drawCard());

    const playerValue = handValue(playerHand), dealerValue = handValue(dealerHand);
    const outcome = dealerValue > 21 || playerValue > dealerValue ? "win" : playerValue === dealerValue ? "push" : "lose";
    return finish(player, stake, playerHand, dealerHand, outcome, isNpcInteraction);
}

export async function start21Game(player, isNpcInteraction = false) {
    if (!GameEconomy.beginSession(player, "21")) {
        player.sendMessage("§cFinish your current Moneyz game first.");
        return;
    }
    try {
        const response = await new ModalFormData().title("§l§621 Game").textField("Stake", "Whole Moneyz amount").show(player);
        if (!response || response.canceled) return returnToMenu(player, isNpcInteraction);
        const check = GameEconomy.validateStake(player, response.formValues?.[0]);
        if (!check.ok) {
            player.sendMessage(check.reason === "insufficient" ? "§cYou don't have enough Moneyz." : "§cEnter a valid positive whole-number stake.");
            return returnToMenu(player, isNpcInteraction);
        }
        if (!GameEconomy.placeBet(player, check.stake, "21")) {
            player.sendMessage("§cYour bet could not be placed.");
            return;
        }
        await playRound(player, check.stake, isNpcInteraction);
    } catch (error) {
        log(`21 game failed for ${player?.nameTag}: ${error}`, LOG_LEVELS.ERROR);
        player?.sendMessage("§cThe 21 game encountered an error.");
    } finally {
        GameEconomy.endSession(player);
    }
}

log("21 Game module loaded", LOG_LEVELS.DEBUG);
