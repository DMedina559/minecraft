import { world, system } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { getScore, getCurrentUTCDate } from '../utilities.js';
import { main } from './moneyz_menu.js';
import { log, LOG_LEVELS } from '../logger.js';

export function openRewardsMenu(player) {
    const rewardValue = world.getDynamicProperty("dailyReward");
    const currentDate = getCurrentUTCDate();
    const lastRedemption = player.getDynamicProperty("lastDailyReward");

 log(`Current reward value: ${rewardValue}, Current date: ${currentDate}, Last redemption for ${player.nameTag}: ${lastRedemption}`, LOG_LEVELS.DEBUG);

    let bodyText = `§l§o§fDaily Rewards!\n\n`;

    if (rewardValue && !isNaN(rewardValue)) {
        if (lastRedemption !== currentDate) {
            bodyText += `§aClaim your daily reward of:\n§f${rewardValue} Moneyz!\n§7Press below to redeem.`;
        } else {
            bodyText += `§cYou have already claimed your daily rewards.\nTry again tomorrow!`;
        }
    } else {
        bodyText += `§cDaily Rewards are currently unavailable.`;
        log(`Daily Rewards unavailable.`, LOG_LEVELS.WARN);
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

    log(`Running dailyRewardLogic for ${player.nameTag}`, LOG_LEVELS.INFO);

    const lastRedemption = player.getDynamicProperty("lastDailyReward");

    log(`Current date: ${currentDate}`, LOG_LEVELS.DEBUG);
    log(`Last redemption date for ${player.nameTag}: ${lastRedemption}`, LOG_LEVELS.DEBUG);

    if (lastRedemption !== currentDate) {
        player.runCommandAsync(`scoreboard players add "${player.nameTag}" Moneyz ${rewardValue}`);
        player.setDynamicProperty("lastDailyReward", currentDate);
        player.sendMessage(`§aYou have claimed your daily rewards! §f${rewardValue} Moneyz`);
        log(`${player.nameTag} claimed daily reward: ${rewardValue} Moneyz`, LOG_LEVELS.INFO);
    } else {
        player.sendMessage("§cYou have already claimed your daily rewards. Come back tomorrow!");
        log(`${player.nameTag} tried to claim reward twice. Last redemption: ${lastRedemption}`, LOG_LEVELS.INFO);
    }
};

log('rewards_menu.js loaded', LOG_LEVELS.DEBUG);