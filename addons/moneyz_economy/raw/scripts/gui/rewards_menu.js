import { world, system } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { getScore,  updateScore, getCurrentUTCDate } from '../utilities.js';
import { main } from './moneyz_menu.js';
import { log, LOG_LEVELS } from '../logger.js';

export function openRewardsMenu(player, isNpcInteraction) {
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
            } else if (!isNpcInteraction){
                main(player); 
            }
        });
}

async function dailyRewardLogic(player, rewardValue) {
    log(`Running dailyRewardLogic for ${player.nameTag}`, LOG_LEVELS.DEBUG);

    const currentDate = getCurrentUTCDate();
    log(`Current date: ${currentDate}`, LOG_LEVELS.DEBUG);

    const lastRedemption = player.getDynamicProperty("lastDailyReward");
    log(`Last redemption date for ${player.nameTag}: ${lastRedemption}`, LOG_LEVELS.DEBUG);

    if (lastRedemption !== currentDate) {
        try {
            const updateResult = await updateScore(player, rewardValue, "add");

            if (updateResult) {
                player.setDynamicProperty("lastDailyReward", currentDate);
                player.sendMessage(`§aYou have claimed your daily rewards! §f${rewardValue} Moneyz`);
                log(`${player.nameTag} successfully claimed daily reward: ${rewardValue} Moneyz`, LOG_LEVELS.INFO);
            } else {
                player.sendMessage("§cAn error occurred while claiming your daily reward. Please try again later.");
                log(`Failed to add ${rewardValue} Moneyz for ${player.nameTag} during daily reward process.`, LOG_LEVELS.ERROR);
            }
        } catch (error) {
            log(`Error during daily reward for ${player.nameTag}: ${error}`, LOG_LEVELS.ERROR);
            player.sendMessage("§cAn unexpected error occurred while claiming your daily reward.");
        }
    } else {
        player.sendMessage("§cYou have already claimed your daily rewards. Come back tomorrow!");
        log(`${player.nameTag} tried to claim reward twice. Last redemption: ${lastRedemption}`, LOG_LEVELS.INFO);
    }
}


log('rewards_menu.js loaded', LOG_LEVELS.DEBUG);