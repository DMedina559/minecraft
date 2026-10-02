import { ActionFormData } from "../ui/forms.js";

import { main } from "./moneyz_menu.js";
import { chanceMenu } from "./chance_menu.js";
import { luckyPurchase } from "./lucky_purchase.js";
import { log, LOG_LEVELS } from "../logger.js";
import * as Config from "../core/config.js";
import * as Economy from "../core/economy.js";

export function luckyMenu(player) {
    if (!player) return;

    const form = new ActionFormData();
    form.title("§l§1Feeling Lucky?");
    form.body(`§l§o§fWelcome §g${player.nameTag}§f!\nTest your Luck\nChoose an Option Below\n§fMoneyz Balance: §g${Economy.getBalance(player)}`);

    const buttons = [];
    const actions = [];

    if (player.getDynamicProperty("moneyzLucky") === "true") {
        buttons.push("§d§lLucky Purchase\n§r§7[ Click to Shop ]");
        actions.push(() => luckyPurchase(player));
    }

    if (player.getDynamicProperty("moneyzChance") === "true") {
        buttons.push("§d§lChance Games\n§r§7[ Click to Play ]");
        actions.push(() => chanceMenu(player));
    }

    buttons.push("§c§lBack");
    actions.push(() => main(player));

    buttons.forEach(button => form.button(button));

    form.show(player).then(({ selection }) => {
        if (selection !== undefined && selection >= 0 && selection < actions.length) {
            actions[selection]();
        }
    });
}

log("lucky_menu.js loaded", LOG_LEVELS.DEBUG);
