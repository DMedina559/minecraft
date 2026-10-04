import { system } from "@minecraft/server";
import { ActionFormData } from "../ui/forms.js";
import * as Economy from "../core/economy.js";
import * as Config from "../core/config.js";
import { openRewardsMenu } from "./rewards_menu.js";
import { moneyzAdmin } from "./admin_menu.js";
import { luckyMenu } from "./lucky_menu.js";
import { getShopData } from "../data_provider.js";
import { openAtm } from "./atm.js";
import { openSendMoney } from "./send_money.js";
import { openHelp } from "./help.js";
import { openJobs } from "./jobs.js";
import { openProperties } from "./properties.js";
import { showShopCategories } from "./main_shop.js";
import { giveQuest } from "./quest_menu.js";
import { log, LOG_LEVELS } from "../logger.js";
import { ui as uiExtensions } from "../api/extensions.js";

export function main(player) {
    if (!player) return;

    const form = new ActionFormData();
    form.title("§l§1Moneyz Menu");
    form.body(`§l§o§fWelcome §g${player.nameTag}§f!\n§fMoneyz Balance: §g${Economy.getBalance(player)}`);

    const buttons = [];
    const actions = [];
    const sections = new Map();
    const section = label => sections.set(buttons.length, label);
    section("Shopping & Money");

    if (Config.bool("moneyzShop", true, player)) {
        buttons.push("§d§lShops\n§r§7[ Click to Shop ]");
        actions.push(() => shops(player));
    }

    if (Config.bool("moneyzATM", true, player)) {
        buttons.push("§d§lATM Exchange\n§r§7[ Trade resources and Moneyz ]");
        actions.push(() => openAtm(player));
    }

    if (Config.bool("moneyzSend", true, player)) {
        buttons.push("§d§lSend Moneyz\n§r§7[ Click to Send Moneyz ]");
        actions.push(() => openSendMoney(player));
    }

    section("Work & Properties");
    buttons.push("§d§lJobs & Employment\n§r§7[ Apply / Pay / Quit ]");
    actions.push(() => openJobs(player));

    buttons.push("§d§lReal Estate\n§r§7[ Buy / Sell / Rent ]");
    actions.push(() => openProperties(player));

    buttons.push("§d§lHotel Services\n§r§7[ Rooms / Rentals ]");
    actions.push(() => openProperties(player,{type:"hotel"}));

    section("Rewards & Games");
    if (Config.bool("moneyzQuest", true, player)) {
        buttons.push("§d§lQuest\n§r§7[ Click to View ]");
        actions.push(() => giveQuest(player));
    }

    if (Config.bool("moneyzDaily", true, player)) {
        buttons.push("§d§lDaily Reward\n§r§7[ Click to Redeem ]");
        actions.push(() => openRewardsMenu(player));
    }

    if (Config.bool("moneyzLucky", true, player) || Config.bool("moneyzChance", true, player)) {
        buttons.push("§d§lFeeling Lucky?\n§r§7[ Click to See ]");
        actions.push(() => luckyMenu(player));
    }

    section("More & Administration");
    for (const item of uiExtensions.listMenuItems()) {
        try {
            if (item.visible && !item.visible(player)) continue;
            buttons.push(item.label ?? item.id);
            actions.push(() => item.open?.(player));
        } catch (e) { log(`Extension menu ${item.id} failed: ${e}`, LOG_LEVELS.WARN); }
    }

    if (player.hasTag("moneyzAdmin")) {
        buttons.push("§d§lMoneyz Admin\n§r§7[ Click to Manage ]");
        actions.push(() => moneyzAdmin(player));
    }

    buttons.push("§d§lHelp\n§r§7[ Click for Help ]");
    actions.push(() => openHelp(player));

    buttons.push("§d§lCredits\n§r§7[ Click to View ]");
    actions.push(() => Credits(player));

    buttons.push("§c§lExit Menu");
    actions.push(() => {});

    buttons.forEach((btn, index) => {
        if (sections.has(index)) form.header(sections.get(index));
        form.button(btn);
    });

    form.show(player).then(({ selection }) => {
        if (selection !== undefined && selection >= 0 && selection < actions.length) {
            actions[selection]();
        }
    }).catch(err => log(`Error showing main menu: ${err}`, LOG_LEVELS.ERROR));
}

export function shops(player) {
    const shopData = getShopData();
    const shopIds = Object.keys(shopData).filter(id => shopData[id]?.enabled !== false && shopData[id]?.settings?.showInBrowser !== false);

    const form = new ActionFormData()
        .title("§l§1Shop Menu")
        .body(`§l§o§fMoneyz Balance: §g${Economy.getBalance(player)}`);

    shopIds.forEach(shopId => {
        const displayName = shopData[shopId]?.name ?? shopId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        form.button(`§d§l${displayName}\n§r§7[ Click to Shop ]`);
    });

    form.button("§c§lMain Menu");

    form.show(player).then(r => {
        if (r.canceled) return;
        const selection = r.selection;

        if (selection < shopIds.length) {
            showShopCategories(player, shopIds[selection]);
        } else {
            main(player);
        }
    }).catch(error => {
        log(`Error showing shop menu: ${error.message}`, LOG_LEVELS.ERROR);
        player.sendMessage("§cAn error occurred while opening the shop.");
    });
}

function Credits(player) {
    new ActionFormData()
        .title("§l§1Credits")
        .body("\n§l§5Creator: §dZVortex11325\n§5Link: §dlinktr.ee/dmedina559\n§5Platform API: §d2.0.0")
        .button("§c§lBack")
        .show(player)
        .then(r => {
            if (r.selection === 0) main(player);
        });
}

log("moneyz_menu.js loaded", LOG_LEVELS.DEBUG);
