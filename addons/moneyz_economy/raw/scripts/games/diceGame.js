import { defer } from "../ui/navigation.js";
import * as Feedback from "../core/feedback.js";
import { system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "../ui/forms.js";
import { getRandomInt } from "../utilities.js";
import * as GameEconomy from "../services/game_economy.js";
import { chanceMenu } from "../gui/chance_menu.js";
import { log, LOG_LEVELS } from "../logger.js";
import * as Config from "../core/config.js";

const rollDice = () => [getRandomInt(1, 6), getRandomInt(1, 6)];
const total = dice => dice[0] + dice[1];
const diceText = dice => `${dice[0]} + ${dice[1]} = ${total(dice)}`;
const back = (player, npc) => { if (!npc) defer(() => chanceMenu(player)); };

async function result(player, stake, outcome, detail, npc) {
    const multiplier = Math.max(1, Config.number("chanceX", 2));
    let summary;
    if (outcome === "win") {
        const payout = Math.round(stake * multiplier);
        const paid=GameEconomy.payout(player, payout, "dice", { outcome: detail });
        summary = !paid?"§cWin payout failed. Please contact an admin.":`§aYou win! §e+${payout} Moneyz`;
        if(paid)Feedback.celebrate(player);else Feedback.error(player);
    } else {
        summary = `§cYou lose ${stake} Moneyz.`;
        try { Feedback.error(player); } catch {}
    }
    const r = await new ActionFormData().npcContext(npc).title("§l§6Dice Game - Craps").body(`${detail}\n\n${summary}`).button("Play Again").button("Back").show(player);
    if (r && !r.canceled && r.selection === 0) defer(() => startCrapsGame(player, npc));
    else if (r && !r.canceled) back(player, npc);
}

async function play(player, stake, npc) {
    const first = rollDice(), firstTotal = total(first);
    if (firstTotal === 7 || firstTotal === 11) return result(player, stake, "win", `Come-out roll: ${diceText(first)}\nNatural.`, npc);
    if ([2, 3, 12].includes(firstTotal)) return result(player, stake, "lose", `Come-out roll: ${diceText(first)}\nCraps.`, npc);

    const point = firstTotal;
    let last = `Come-out roll: ${diceText(first)}\n§ePoint is ${point}.`;
    while (true) {
        const r = await new ActionFormData().npcContext(npc).title("§l§6Dice Game - Craps").body(`${last}\n\nRoll ${point} before 7 to win.`).button("Roll Dice").button("Forfeit & Back").show(player);
        if (!r || r.canceled) return; // closing forfeits an already-placed bet
        if (r.selection === 1) { back(player, npc); return; }
        const dice = rollDice(), n = total(dice);
        if (n === point) return result(player, stake, "win", `Roll: ${diceText(dice)}\nPoint hit!`, npc);
        if (n === 7) return result(player, stake, "lose", `Roll: ${diceText(dice)}\nSeven out.`, npc);
        last = `Roll: ${diceText(dice)}\n§ePoint remains ${point}.`;
    }
}

export async function startCrapsGame(player, isNpcInteraction = false) {
    if (!GameEconomy.beginSession(player, "dice")) return Feedback.message(player,"§cFinish your current Moneyz game first.");
    try {
        const response = await new ModalFormData().npcContext(isNpcInteraction).title("§l§6Dice Game (Craps)").textField("Stake", "Whole Moneyz amount").show(player);
        if(response?.navigated)return;
        if (!response || response.canceled) return back(player, isNpcInteraction);
        const check = GameEconomy.validateStake(player, response.formValues?.[0]);
        if (!check.ok) {
            Feedback.message(player,check.reason === "insufficient" ? "§cYou don't have enough Moneyz." : "§cEnter a valid positive whole-number stake.");
            return back(player, isNpcInteraction);
        }
        if (!GameEconomy.placeBet(player, check.stake, "dice")) return Feedback.message(player,"§cYour bet could not be placed.");
        await play(player, check.stake, isNpcInteraction);
    } catch (error) {
        log(`Craps failed for ${player?.nameTag}: ${error}`, LOG_LEVELS.ERROR);
        Feedback.message(player,"§cThe dice game encountered an error.");
    } finally { GameEconomy.endSession(player); }
}

log("diceGame.js loaded", LOG_LEVELS.DEBUG);
