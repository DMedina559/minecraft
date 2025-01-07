import { world, system } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { getScore, getCurrentUTCDate } from '../utilities.js';
import { main } from './moneyz_menu.js';
import { chanceMenu } from './chance_menu.js';
import { luckyPurchase } from './lucky_purchase.js';
import { log, LOG_LEVELS } from '../logger.js';


export function luckyMenu(player) {
    
    const form = new ActionFormData();
    form.title("§l§1Feeling Lucky?");
    
    form.body(`§l§o§fWelcome §g${player.nameTag}§f!\nTest your Luck\nChoose an Option Below\n§fMoneyz Balance: §g${getScore('Moneyz', player.nameTag)}`);
    
    const buttons = [];
    const actions = [];

    if (player.getDynamicProperty('moneyzLucky') === "true") {
        buttons.push('§d§lLucky Purchase\n§r§7[ Click to Shop ]');
        actions.push(() => luckyPurchase(player));
    }
    
    if (player.getDynamicProperty('moneyzChance') === "true") {
        buttons.push('§d§lChance Games\n§r§7[ Click to Play ]');
        actions.push(() => chanceMenu(player));
    }

    buttons.push('§4§lBack');
    actions.push(() => main(player));
    
    buttons.forEach(button => form.button(button));

    form.show(player).then(({ selection }) => {
        if (selection >= 0 && selection < actions.length) {
            actions[selection]();
        }
    });
};

log('lucky_menu.js loaded', LOG_LEVELS.DEBUG);