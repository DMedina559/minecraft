import { world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { main } from "./moneyz_menu.js";
import { getScore, updateScore } from '../utilities.js';
import { log, LOG_LEVELS } from "../logger.js";

const SHOP_WORLD_PROPERTY_PREFIX = "shopItem_";

export async function customShop(player, isNpcInteraction) {
    log(`Player ${player.nameTag} opened the Custom Shop Menu.`, LOG_LEVELS.DEBUG);

    const shopName = world.getDynamicProperty("customShop") || "Custom Shop";

    try {
        const shopItems = await getShopItemsFromWorldProperties();
        
        if (!Array.isArray(shopItems) || shopItems.length === 0) {
            player.sendMessage("§cNo shop items available.");
            log("No shop items available.", LOG_LEVELS.INFO);
            return;
        }

        log("Fetched Shop Items from world properties:", LOG_LEVELS.DEBUG, shopItems);

        const form = new ActionFormData();
        form.title(`§l§1${shopName}`);

        shopItems.forEach(shopItem => {
            const displayName = shopItem.buyAmount && shopItem.itemName && shopItem.buyCost
                ? `§d§l${shopItem.buyAmount} ${shopItem.itemName}\n${shopItem.buyCost} Moneyz`
                : "§cInvalid Item";
            form.button(displayName);
            log(`Button for item ${shopItem.itemName} added to form.`, LOG_LEVELS.DEBUG);
        });

        form.button("§c§lBack");

        const response = await form.show(player);

        if (response.isCanceled) {
            log(`Player ${player.nameTag} canceled the shop menu.`, LOG_LEVELS.DEBUG);
            return;
        }

        const selection = response.selection;

        log("Shop Items in customShop:", LOG_LEVELS.DEBUG, shopItems);

        if (selection >= 0 && selection < shopItems.length) {
            log("shopItems[selection]:", LOG_LEVELS.DEBUG, shopItems[selection]);
            handleShopItemMenu(player, shopItems[selection]);
        } else if (selection === shopItems.length && !isNpcInteraction) {
            log(`Player ${player.nameTag} went back from shop menu.`, LOG_LEVELS.DEBUG);
            main(player);
        }

    } catch (error) {
        log("Error in customShop:", LOG_LEVELS.ERROR, error);
        player.sendMessage("§cAn error occurred while opening the Custom Shop.");
    }
}

async function getShopItemsFromWorldProperties() {
    const shopItems = [];
    const properties = world.getDynamicPropertyIds().filter(id => id.startsWith(SHOP_WORLD_PROPERTY_PREFIX));

    log("Shop property keys:", LOG_LEVELS.DEBUG, properties);

    for (const key of properties) {
        const shopString = world.getDynamicProperty(key);
        const shopItem = parseShopItem(shopString);
        if (shopItem) {
            shopItems.push(shopItem);
            log(`Parsed shop item for key ${key}:`, LOG_LEVELS.DEBUG, shopItem);
        }
    }
    return shopItems;
}

function parseShopItem(shopString) {
    try {
        const [itemName, buyAmount, buyCost, buyData, sellAmount, sellCost, sellData] = shopString.split(",");
        const shopItem = {
            itemName,
            buyAmount: parseInt(buyAmount || 0, 10),
            buyCost: parseInt(buyCost || 0, 10),
            buyData: parseInt(buyData || 0, 10),
            sellAmount: parseInt(sellAmount || 0, 10),
            sellCost: parseInt(sellCost || 0, 10),
            sellData: parseInt(sellData || 0, 10),
        };
        return shopItem;
    } catch (error) {
        log(`Error parsing shop item: ${shopString}`, LOG_LEVELS.ERROR, error);
        return null;
    }
}

async function handleShopItemMenu(player, shopItem) {
    const form = new ActionFormData();
    form.title(`Shop: ${shopItem.itemName}`);
    form.button(`Buy ${shopItem.buyAmount} for ${shopItem.buyCost} Moneyz`);
    form.button(`Sell ${shopItem.sellAmount} for ${shopItem.sellCost} Moneyz`);
    form.button("Back");

    log(`Displaying shop item menu for ${shopItem.itemName}.`, LOG_LEVELS.DEBUG);

    try {
        const response = await form.show(player);
        if (response.isCanceled) {
            log(`Player ${player.nameTag} canceled the shop item menu.`, LOG_LEVELS.DEBUG);
            return;
        }

        const selection = response.selection;

        log(`Player ${player.nameTag} selected option: ${selection}`, LOG_LEVELS.DEBUG);

        if (selection === 0) {
            try {
                handleBuy(player, shopItem);
            } catch (error) {
                log("Error in handleBuy call:", LOG_LEVELS.ERROR, error);
                player.sendMessage("An error occurred during purchase. Check logs.");
            }
        } else if (selection === 1) {
            handleSell(player, shopItem);
        } else {
            log(`Player ${player.nameTag} went back from item menu.`, LOG_LEVELS.DEBUG);
            customShop(player);
        }
    } catch (error) {
        log("Error showing Shop Item Menu:", LOG_LEVELS.ERROR, error);
        player.sendMessage("§cAn error occurred. Check logs.");
    }
}

async function handleBuy(player, shopItem) {
    log("Shop Item in handleBuy:", LOG_LEVELS.DEBUG, JSON.stringify(shopItem, null, 2));

    const { itemName, buyAmount, buyCost, buyData } = shopItem;

    log(`Attempting to buy ${buyAmount} ${itemName} for ${buyCost} Moneyz.`, LOG_LEVELS.DEBUG);

    try {
        if (!player || typeof player.runCommandAsync !== 'function') {
            log("Error: player or runCommandAsync is not a function.", LOG_LEVELS.ERROR);
            return;
        }

        const playerMoney = getScore("Moneyz", player);
        log("Player Moneyz (raw score):", LOG_LEVELS.DEBUG, playerMoney);

        if (isNaN(playerMoney) || playerMoney < buyCost) {
            player.playSound("note.bass");
            player.sendMessage(`§cYou need ${buyCost} Moneyz to buy ${buyAmount} ${itemName}!\n§6You have ${playerMoney} Moneyz`);
            log(`Player ${player.nameTag} has insufficient Moneyz.`, LOG_LEVELS.INFO);
            return;
        }

        const giveCommand = buyData !== 0 ? `give @s ${String(itemName)} ${String(buyAmount)} ${String(buyData)}` : `give @s ${String(itemName)} ${String(buyAmount)}`;
        player.runCommand(giveCommand);
        
        updateScore(player, buyCost, "remove");

        player.playSound("random.levelup");
        player.sendMessage(`§aPurchased ${String(buyAmount)} ${String(itemName)} for ${String(buyCost)} Moneyz.`);
        log(`${player.nameTag} bought ${String(buyAmount)} ${String(itemName)} for ${String(buyCost)} Moneyz.`, LOG_LEVELS.INFO);
    } catch (error) {
        log("Error in handleBuy:", LOG_LEVELS.ERROR, error.stack);
        player.sendMessage("§cError processing purchase. Check logs.");
    }
}

async function handleSell(player, shopItem) {
    log("Shop Item in handleSell:", LOG_LEVELS.DEBUG, JSON.stringify(shopItem, null, 2));
    const { itemName, sellAmount, sellCost, sellData } = shopItem;

    try {
        const hasItemCheck = `testfor @s[hasitem={item=${itemName},data=${sellData},quantity=${sellAmount}..}]`;
        const testResult = player.runCommand(hasItemCheck);

        if (testResult.successCount > 0) {
            updateScore(player, sellCost, "add");
            
            const clearCommand = `clear @s ${itemName} ${sellData !== 0 ? sellData : 0} ${sellAmount}`;
            player.runCommand(clearCommand);

            player.playSound("random.levelup");
            player.sendMessage(`§aSold ${sellAmount} ${itemName} for ${sellCost} Moneyz!`);
            log(`${player.nameTag} sold ${sellAmount} ${itemName}.`, LOG_LEVELS.INFO);
        } else {
            player.playSound("note.bass");
            player.sendMessage(`§cYou don't have enough ${itemName} to sell.`);
            log(`${player.nameTag} failed to sell ${sellAmount} ${itemName}.`, LOG_LEVELS.INFO);
        }
    } catch (error) {
        log(`Error in handleSell: ${error.message}`, LOG_LEVELS.ERROR, error.stack);
        player.sendMessage("§cError processing sell transaction. Please check logs.");
    }
}
