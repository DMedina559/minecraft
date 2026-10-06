import { defer } from "../ui/navigation.js";
import * as Feedback from "../core/feedback.js";
import { system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "../ui/forms.js";
import { getRandomInt } from "../utilities.js";
import * as GameEconomy from "../services/game_economy.js";
import { chanceMenu } from "../gui/chance_menu.js";
import { log, LOG_LEVELS } from "../logger.js";
import * as Config from "../core/config.js";

const SYMBOLS = [
    { name: "Cherry", weight: 28 }, { name: "Lemon", weight: 24 }, { name: "Orange", weight: 18 },
    { name: "Plum", weight: 13 }, { name: "Bell", weight: 8 }, { name: "Bar", weight: 6 }, { name: "Seven", weight: 3 }
];
const totalWeight = SYMBOLS.reduce((n, s) => n + s.weight, 0);
function symbol() {
    let roll = getRandomInt(1, totalWeight);
    for (const s of SYMBOLS) { roll -= s.weight; if (roll <= 0) return s.name; }
    return SYMBOLS[0].name;
}
const spin = () => [symbol(), symbol(), symbol()];
const back = (player, npc) => { if (!npc) defer(() => chanceMenu(player)); };

function payoutFor(reels, stake, base) {
    const [a,b,c] = reels;
    if (a === b && b === c) {
        if (a === "Seven") return { amount: Math.round(stake * base * 5), label: "JACKPOT" };
        if (a === "Bar") return { amount: Math.round(stake * base * 3), label: "BIG WIN" };
        if (a === "Bell") return { amount: Math.round(stake * base * 2), label: "Bell Triple" };
        return { amount: Math.round(stake * base), label: "Three of a Kind" };
    }
    if (a === b || b === c || a === c) return { amount: Math.max(1, Math.round(stake * base / 2)), label: "Two of a Kind" };
    return { amount: 0, label: "No Match" };
}

export async function startSlotsGame(player, isNpcInteraction = false) {
    if (!GameEconomy.beginSession(player, "slots")) return Feedback.message(player,"§cFinish your current Moneyz game first.");
    try {
        const response = await new ModalFormData().npcContext(isNpcInteraction).title("§l§6Slot Machine").textField("Stake", "Whole Moneyz amount").show(player);
        if(response?.navigated)return;
        if (!response || response.canceled) return back(player, isNpcInteraction);
        const check = GameEconomy.validateStake(player, response.formValues?.[0]);
        if (!check.ok) {
            Feedback.message(player,check.reason === "insufficient" ? "§cYou don't have enough Moneyz." : "§cEnter a valid positive whole-number stake.");
            return back(player, isNpcInteraction);
        }
        if (!GameEconomy.placeBet(player, check.stake, "slots")) return Feedback.message(player,"§cYour bet could not be placed.");

        const reels = spin();
        const base = Math.max(1, Config.number("chanceX", 2));
        const win = payoutFor(reels, check.stake, base);
        const paid=win.amount<=0||GameEconomy.payout(player, win.amount, "slots", { reels, result: win.label });
        try { win.amount>0&&paid?Feedback.celebrate(player):Feedback.error(player); } catch {}

        const r = await new ActionFormData().npcContext(isNpcInteraction).title("§l§6Slot Machine")
            .body(`§l[ ${reels.join(" | ")} ]§r\n\n${!paid?"§cWin payout failed. Please contact an admin.":win.amount > 0 ? `§a${win.label}!\n§e+${win.amount} Moneyz` : `§cNo match. You lose ${check.stake} Moneyz.`}`)
            .button("Spin Again").button("Back").show(player);
        if (r && !r.canceled && r.selection === 0) defer(() => startSlotsGame(player, isNpcInteraction));
        else if (r && !r.canceled) back(player, isNpcInteraction);
    } catch (error) {
        log(`Slots failed for ${player?.nameTag}: ${error}`, LOG_LEVELS.ERROR);
        Feedback.message(player,"§cThe slot machine encountered an error.");
    } finally { GameEconomy.endSession(player); }
}

log("slotGame.js loaded", LOG_LEVELS.DEBUG);
