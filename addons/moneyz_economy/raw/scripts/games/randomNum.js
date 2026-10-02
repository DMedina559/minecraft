import { system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "../ui/forms.js";
import { getRandomInt } from "../utilities.js";
import * as GameEconomy from "../services/game_economy.js";
import { chanceMenu } from "../gui/chance_menu.js";
import { log, LOG_LEVELS } from "../logger.js";
import * as Config from "../core/config.js";

const back = (player, npc) => { if (!npc) system.run(() => chanceMenu(player)); };

export async function testYourLuck(player, isNpcInteraction = false) {
    if (!GameEconomy.beginSession(player, "random")) return player.sendMessage("§cFinish your current Moneyz game first.");
    try {
        const response = await new ModalFormData().title("§l§6Test Your Luck").textField("Stake", "Whole Moneyz amount").show(player);
        if (!response || response.canceled) return back(player, isNpcInteraction);
        const check = GameEconomy.validateStake(player, response.formValues?.[0]);
        if (!check.ok) {
            player.sendMessage(check.reason === "insufficient" ? "§cYou don't have enough Moneyz." : "§cEnter a valid positive whole-number stake.");
            return back(player, isNpcInteraction);
        }
        if (!GameEconomy.placeBet(player, check.stake, "random")) return player.sendMessage("§cYour bet could not be placed.");

        const winChance = Math.max(0, Math.min(100, Config.number("chanceWin", 50)));
        const multiplier = Math.max(1, Config.number("chanceX", 2));
        const roll = getRandomInt(1, 100);
        const won = roll <= winChance;
        const payout = won ? Math.round(check.stake * multiplier) : 0;
        if (won) GameEconomy.payout(player, payout, "random", { roll, winChance });
        try { player.playSound(won ? "random.levelup" : "note.bass"); } catch {}

        const r = await new ActionFormData().title("§l§6Test Your Luck")
            .body(`Roll: §e${roll}§r / 100\nWin range: §a1-${winChance}§r\n\n${won ? `§aYou win! §e+${payout} Moneyz` : `§cYou lose ${check.stake} Moneyz.`}`)
            .button("Play Again").button("Back").show(player);
        if (r && !r.canceled && r.selection === 0) system.run(() => testYourLuck(player, isNpcInteraction));
        else if (r && !r.canceled) back(player, isNpcInteraction);
    } catch (error) {
        log(`Test Your Luck failed for ${player?.nameTag}: ${error}`, LOG_LEVELS.ERROR);
        player?.sendMessage("§cTest Your Luck encountered an error.");
    } finally { GameEconomy.endSession(player); }
}

log("randomNum.js loaded", LOG_LEVELS.DEBUG);
