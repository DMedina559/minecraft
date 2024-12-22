import { world, system } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { getScore, getCurrentUTCDate } from '../utilities.js';
import { luckyMenu } from './lucky_menu.js';
import { log, LOG_LEVELS } from '../logger.js';


export function luckyPurchase(player) {    

    function canAccessLuckyMenu(player) {
        const lastAccessDate = player.getDynamicProperty("lastLuckyPurchase");
        const currentDate = getCurrentUTCDate();
        const oneLuckyPurchaseEnabled = world.getDynamicProperty('oneLuckyPurchase');
        log(`Checking Lucky Purchase access for ${player.nameTag}:`, LOG_LEVELS.DEBUG);
        log(`  - lastAccessDate: ${lastAccessDate}`, LOG_LEVELS.DEBUG);
        log(`  - currentDate: ${currentDate}`, LOG_LEVELS.DEBUG);
        log(`  - oneLuckyPurchaseEnabled: ${oneLuckyPurchaseEnabled}`, LOG_LEVELS.DEBUG);
        return !oneLuckyPurchaseEnabled || !lastAccessDate || lastAccessDate !== currentDate;
    }

    if (canAccessLuckyMenu(player)) {
        new ActionFormData()
            .title("§l§1Lucky Purchase Menu")
            .body("§l§o§fChoose a shop to make a lucky purchase!")
            .button("§d§lArmory\n§r§7[ Feeling Lucky? ]")
            .button("§d§lCrafter's Market\n§r§7[ Feeling Lucky? ]")
            .button("§d§lFarmer's Market\n§r§7[ Feeling Lucky? ]")
            .button("§d§lLibrary\n§r§7[ Feeling Lucky? ]")
            .button("§d§lPet Shop\n§r§7[ Feeling Lucky? ]")
            .button("§d§lWorkshop\n§r§7[ Feeling Lucky? ]")
            .button("§4§lBack")
            .show(player).then(r => {
                const currentDate = getCurrentUTCDate();
                log(`Player ${player.nameTag} selection: ${r.selection}`, LOG_LEVELS.INFO);
                
                const oneLuckyPurchaseEnabled = world.getDynamicProperty('oneLuckyPurchase');
                log(`oneLuckyPurchaseEnabled: ${oneLuckyPurchaseEnabled}`, LOG_LEVELS.DEBUG);
                
                const executeLuckyPurchase = (command) => {
                    log(`Executing lucky purchase command: ${command}`, LOG_LEVELS.INFO);
                    player.runCommandAsync(command);
                    
                    if (oneLuckyPurchaseEnabled === 'true') {
                        log(`oneLuckyPurchase is enabled, setting ${player.nameTag}'s lastLuckyPurchase to ${currentDate}`, LOG_LEVELS.INFO);
                        
                        player.setDynamicProperty("lastLuckyPurchase", currentDate);

                    } else {
                        log(`oneLuckyPurchase is disabled in the world properties`, LOG_LEVELS.DEBUG);
                    }
                };

                if (r.selection === 0) executeLuckyPurchase("function armory/lucky");
                if (r.selection === 1) executeLuckyPurchase("function craftershop/lucky");
                if (r.selection === 2) executeLuckyPurchase("function farmers_market/lucky");
                if (r.selection === 3) executeLuckyPurchase("function library/lucky");
                if (r.selection === 4) executeLuckyPurchase("function petshop/lucky");
                if (r.selection === 5) executeLuckyPurchase("function workshop/lucky");
                if (r.selection === 6) luckyMenu(player);
            });
    } else {
        new ActionFormData()
            .title("§l§cLucky Purchase Restricted")
            .body("§cYou have already made your Lucky Purchase today.\n§7Try again tomorrow!")
            .button("§4§lBack")
            .show(player);
    }
}

log('lucky_purchase.js loaded', LOG_LEVELS.DEBUG);