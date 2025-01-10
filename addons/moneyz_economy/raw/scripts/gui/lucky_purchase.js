import { world, system } from "@minecraft/server"
import { ActionFormData } from "@minecraft/server-ui"
import { getScore, getCurrentUTCDate, updateScore } from '../utilities.js';
import { luckyMenu } from './lucky_menu.js';
import { log, LOG_LEVELS } from '../logger.js';

export async function luckyPurchase(player, isNpcInteraction) {

    async function canAccessLuckyMenu(player) {
        const lastAccessDate = player.getDynamicProperty("lastLuckyPurchase");
        const currentDate = getCurrentUTCDate();
        const oneLuckyPurchaseEnabled = world.getDynamicProperty('oneLuckyPurchase');
        log(`Checking Lucky Purchase access for ${player.nameTag}:`, LOG_LEVELS.DEBUG);
        log(`   - lastAccessDate: ${lastAccessDate}`, LOG_LEVELS.DEBUG);
        log(`   - currentDate: ${currentDate}`, LOG_LEVELS.DEBUG);
        log(`   - oneLuckyPurchaseEnabled: ${oneLuckyPurchaseEnabled}`, LOG_LEVELS.DEBUG);
        return !oneLuckyPurchaseEnabled || !lastAccessDate || lastAccessDate !== currentDate;
    }

    if (await canAccessLuckyMenu(player)) {
        new ActionFormData()
            .title("§l§1Lucky Purchase")
            .body("§l§o§fMake a Lucky Purchase for 150 Moneyz!")
            .button("§a§lMake Purchase")
            .button("§c§lBack")
            .show(player).then(async r => {
                if (r.selection === 0) {
                    const currentDate = getCurrentUTCDate();
                    const oneLuckyPurchaseEnabled = world.getDynamicProperty('oneLuckyPurchase');

                    const money = await getScore("Moneyz", player);

                    if (money >= 150) {
                        player.runCommandAsync("playsound random.levelup @s ~ ~ ~");
                        player.sendMessage("§aYou can make a Lucky Purchase!");

                        player.runCommandAsync(`loot spawn ~ ~ ~ loot "lucky_purchase"`);

                        player.sendMessage("§aDo You Feel Lucky?");
                        await updateScore(player, 150, "remove");

                        if (oneLuckyPurchaseEnabled === 'true') {
                            log(`oneLuckyPurchase is enabled, setting ${player.nameTag}'s lastLuckyPurchase to ${currentDate}`, LOG_LEVELS.INFO);
                            player.setDynamicProperty("lastLuckyPurchase", currentDate);
                        } else {
                            log(`oneLuckyPurchase is disabled in the world properties`, LOG_LEVELS.DEBUG);
                        }
                    } else {
                        player.runCommandAsync("playsound note.bassattack @s ~ ~ ~");
                        player.sendMessage(`§cYou need 150 Moneyz for this purchase\n§6You have ${money} Moneyz`);
                    }
                } else if (r.selection === 1 && !isNpcInteraction) {
                    luckyMenu(player);
                }
            }).catch(err => {
                log(`Error in ActionFormData: ${err}`, LOG_LEVELS.ERROR);
            });
    } else {
        new ActionFormData()
            .title("§l§cLucky Purchase Restricted")
            .body("§cYou have already made your Lucky Purchase today.\n§7Try again tomorrow!")
            .button("§c§lBack")
            .show(player);
    }
}


log('lucky_purchase.js loaded', LOG_LEVELS.DEBUG);