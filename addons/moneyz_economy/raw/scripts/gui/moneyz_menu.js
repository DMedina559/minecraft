import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { runCommand } from "../utilities.js";
import * as Economy from "../core/economy.js";
import * as Config from "../core/config.js";
import { openRewardsMenu } from "./rewards_menu.js";
import { moneyzAdmin } from "./admin_menu.js";
import { luckyMenu } from "./lucky_menu.js";
import { getShopData } from "../data_provider.js";
import { customShop } from "./custom_shop.js";
import { showShopCategories } from "./main_shop.js";
import { giveQuest } from "./quest_menu.js";
import { log, LOG_LEVELS } from "../logger.js";

export function main(player) {
    if (!player) return;

    const form = new ActionFormData();
    form.title("§l§1Moneyz Menu");
    form.body(`§l§o§fWelcome §g${player.nameTag}§f!\n§fMoneyz Balance: §g${Economy.getBalance(player)}`);

    const buttons = [];
    const actions = [];

    if (Config.bool("moneyzShop", true, player)) {
        buttons.push("§d§lShops\n§r§7[ Click to Shop ]");
        actions.push(() => shops(player));
    }

    if (Config.bool("moneyzATM", true, player)) {
        buttons.push("§d§lATM\n§r§7[ Click to Exchange ]");
        actions.push(() => {
            const playerName = player.nameTag || player.name;
            runCommand(player, `execute as "${playerName.replace(/"/g, '\\"')}" run dialogue open @s @s atm`);
        });
    }

    if (Config.bool("moneyzSend", true, player)) {
        buttons.push("§d§lSend Moneyz\n§r§7[ Click to Send Moneyz ]");
        actions.push(() => moneyzTransfer(player));
    }

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

    if (player.hasTag("moneyzAdmin")) {
        buttons.push("§d§lMoneyz Admin\n§r§7[ Click to Manage ]");
        actions.push(() => moneyzAdmin(player));
    }

    buttons.push("§d§lHelp\n§r§7[ Click for Help ]");
    actions.push(() => {
        const playerName = player.nameTag || player.name;
        runCommand(player, `execute as "${playerName.replace(/"/g, '\\"')}" run dialogue open @s @s help`);
    });

    buttons.push("§d§lCredits\n§r§7[ Click to View ]");
    actions.push(() => Credits(player));

    buttons.push("§c§lExit Menu");
    actions.push(() => {});

    buttons.forEach(btn => form.button(btn));

    form.show(player).then(({ selection }) => {
        if (selection !== undefined && selection >= 0 && selection < actions.length) {
            actions[selection]();
        }
    }).catch(err => log(`Error showing main menu: ${err}`, LOG_LEVELS.ERROR));
}

function shops(player) {
    const customShopName = Config.get("customShop", "Custom Shop");
    const shopData = getShopData();
    const shopIds = Object.keys(shopData);

    const form = new ActionFormData()
        .title("§l§1Shop Menu")
        .body(`§l§o§fMoneyz Balance: §g${Economy.getBalance(player)}`);

    shopIds.forEach(shopId => {
        const displayName = shopId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        form.button(`§d§l${displayName}\n§r§7[ Click to Shop ]`);
    });

    form.button(`§d§l${customShopName}\n§r§7[ Click to Shop ]`);
    form.button("§c§lBack");

    form.show(player).then(r => {
        if (r.canceled) return;
        const selection = r.selection;

        if (selection < shopIds.length) {
            showShopCategories(player, shopIds[selection]);
        } else if (selection === shopIds.length) {
            customShop(player);
        } else {
            main(player);
        }
    }).catch(error => {
        log(`Error showing shop menu: ${error.message}`, LOG_LEVELS.ERROR);
        player.sendMessage("§cAn error occurred while opening the shop.");
    });
}

async function moneyzTransfer(player) {
    const players = [...world.getPlayers()];
    const currentBalance = Economy.getBalance(player);

    new ModalFormData()
        .title("§l§1Send Moneyz")
        .dropdown("§o§fChoose Who to Send Moneyz to!", players.map(p => p.nameTag))
        .textField(`§fEnter the Amount to Send!\n§fMoneyz Balance: §g${currentBalance}`, "§oNumbers Only")
        .show(player)
        .then(result => {
            if (!result || result.canceled || !result.formValues) return;

            const [dropdownIndex, textField] = result.formValues;
            if (dropdownIndex === undefined) return;

            const selectedPlayer = players[dropdownIndex];

            if (!selectedPlayer || selectedPlayer.nameTag === player.nameTag) {
                try { player.playSound("note.bass"); } catch {}
                player.sendMessage("§cYou Can't Send Moneyz to Yourself");
                moneyzTransfer(player);
                return;
            }

            const amountToSend = parseInt(textField, 10);
            if (isNaN(amountToSend) || amountToSend <= 0) {
                try { player.playSound("note.bass"); } catch {}
                player.sendMessage("§cPlease enter a valid positive number!");
                moneyzTransfer(player);
                return;
            }

            if (currentBalance < amountToSend) {
                try { player.playSound("note.bass"); } catch {}
                player.sendMessage("§cYou Don't Have Enough Moneyz");
                moneyzTransfer(player);
                return;
            }

            try {
                if (!Economy.transfer(player, selectedPlayer, amountToSend, { source: "player_transfer" })) {
                    throw new Error("Transfer rejected");
                }

                try { player.playSound("random.levelup"); } catch {}
                player.sendMessage(`§aSent §l${selectedPlayer.nameTag} §r§2${amountToSend} Moneyz`);

                try { selectedPlayer.playSound("random.levelup"); } catch {}
                selectedPlayer.sendMessage(`§l${player.nameTag} §r§aSent You §2${amountToSend} Moneyz`);
            } catch (error) {
                try { player.playSound("note.bass"); } catch {}
                player.sendMessage("§cAn error occurred during the transfer.");
            }
        })
        .catch(error => {
            log(`Error during Money Transfer Menu: ${error}`, LOG_LEVELS.ERROR);
        });
}

function Credits(player) {
    new ActionFormData()
        .title("§l§1Credits")
        .body("\n§l§5Creator: §dZVortex11325\n§5Link: §dlinktr.ee/dmedina559\n§5Version: §d1.10.1")
        .button("§c§lBack")
        .show(player)
        .then(r => {
            if (r.selection === 0) main(player);
        });
}

log("moneyz_menu.js loaded", LOG_LEVELS.DEBUG);
