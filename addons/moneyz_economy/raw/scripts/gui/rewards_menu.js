import { world } from "@minecraft/server";
import { ActionFormData } from "../ui/forms.js";
import { getCurrentUTCDate } from "../utilities.js";
import { main } from "./moneyz_menu.js";
import { log, LOG_LEVELS } from "../logger.js";
import * as Economy from "../core/economy.js";
import * as Config from "../core/config.js";

export function openRewardsMenu(player, isNpcInteraction) {
    if (!player) return;

    const rewardValue = Config.get("dailyReward", 25);
    const currentDate = getCurrentUTCDate();
    const lastRedemption = player.getDynamicProperty("lastDailyReward");

    let bodyText = "§l§o§fDaily Rewards!\n\n";

    if (rewardValue && !isNaN(rewardValue)) {
        if (lastRedemption !== currentDate) {
            bodyText += `§aClaim your daily reward of:\n§f${rewardValue} Moneyz!\n§7Press below to redeem.`;
        } else {
            bodyText += "§cYou have already claimed your daily rewards.\nTry again tomorrow!";
        }
    } else {
        bodyText += "§cDaily Rewards are currently unavailable.";
    }

    const form = new ActionFormData()
        .title("§l§1Daily Rewards")
        .body(bodyText);

    if (lastRedemption !== currentDate) {
        form.button("§a§lClaim Rewards");
    }

    form.button("§c§lBack")
        .show(player)
        .then(r => {
            if (!r || r.canceled) return;
            if (r.selection === 0 && lastRedemption !== currentDate) {
                dailyRewardLogic(player, rewardValue);
            } else if (!isNpcInteraction) {
                main(player);
            }
        });
}

async function dailyRewardLogic(player, rewardValue) {
    const currentDate = getCurrentUTCDate();
    const lastRedemption = player.getDynamicProperty("lastDailyReward");

    if (lastRedemption !== currentDate) {
        try {
            const updateResult = Economy.deposit(player, rewardValue, { type: "daily_reward", source: "daily_reward" });
            if (updateResult) {
                player.setDynamicProperty("lastDailyReward", currentDate);
                try { player.playSound("random.levelup"); } catch {}
                player.sendMessage(`§aYou have claimed your daily rewards! §f${rewardValue} Moneyz`);
            } else {
                player.sendMessage("§cAn error occurred while claiming your daily reward. Please try again later.");
            }
        } catch (error) {
            log(`Error during daily reward for ${player.nameTag}: ${error}`, LOG_LEVELS.ERROR);
            player.sendMessage("§cAn unexpected error occurred while claiming your daily reward.");
        }
    } else {
        player.sendMessage("§cYou have already claimed your daily rewards. Come back tomorrow!");
    }
}

log("rewards_menu.js loaded", LOG_LEVELS.DEBUG);
