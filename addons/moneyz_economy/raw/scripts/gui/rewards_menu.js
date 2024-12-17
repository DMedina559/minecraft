import { world, system } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { getScore, getCurrentUTCDate } from '../utilities.js';
import { main } from './moneyz_menu.js';

export function openRewardsMenu(player) {
    const rewardValue = world.getDynamicProperty("dailyReward");
    const currentDate = getCurrentUTCDate();
    const lastRedemption = player.getDynamicProperty("dailyRedeemed");

    let bodyText = `§l§o§fDaily Rewards!\n\n`;

    if (rewardValue && !isNaN(rewardValue)) {
        if (lastRedemption !== currentDate) {
            bodyText += `§aClaim your daily reward of:\n§f${rewardValue} Moneyz!\n§7Press below to redeem.`;
        } else {
            bodyText += `§cYou have already claimed your daily rewards.\nTry again tomorrow!`;
        }
    } else {
        bodyText += `§cDaily Rewards are currently unavailable.`;
    }

    const form = new ActionFormData()
        .title("§l§1Daily Rewards")
        .body(bodyText);

    if (lastRedemption !== currentDate) {
        form.button("§a§lClaim Rewards"); 
    }

    form.button("§4§lBack")
        .show(player)
        .then(r => {
            if (r.selection === 0 && lastRedemption !== currentDate) { 
                dailyRewardLogic(player, rewardValue, currentDate);
            }
            main(player); 
        });
}

function dailyRewardLogic(player, rewardValue, currentDate) {
    const lastRedemption = player.getDynamicProperty("dailyRedeemed");

    if (lastRedemption !== currentDate) {
        player.runCommandAsync(`scoreboard players add "${player.nameTag}" Moneyz ${rewardValue}`);

        player.setDynamicProperty("dailyRedeemed", currentDate);

        player.sendMessage(`§aYou have claimed your daily rewards! §f${rewardValue} Moneyz`);
    } else {

        player.sendMessage("§cYou have already claimed your daily rewards. Come back tomorrow!");
    }
};