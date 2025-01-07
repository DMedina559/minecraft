import { world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { main } from "./moneyz_menu.js";
import { getScore, updateScore } from '../utilities.js';
import { log, LOG_LEVELS } from "../logger.js";

const SHOP_WORLD_PROPERTY_PREFIX = "shopItem_";

export async function customShop(player) {
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

        form.button("§4§lBack");

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
        } else if (selection === shopItems.length) {
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
    form.button(`Sell ${shopItem.sellAmount} for ${shopItem.sellAmount} Moneyz`);
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

        const playerMoney = await getScore("Moneyz", player);
        log("Player Moneyz (raw score):", LOG_LEVELS.DEBUG, playerMoney);

        if (isNaN(playerMoney) || playerMoney < buyCost) {
            await player.runCommandAsync(`playsound note.bassattack @s ~ ~ ~`);
            await player.runCommandAsync(`tell @s §cYou can't buy ${buyAmount} ${itemName}!`);
            await player.runCommandAsync(`tellraw @s {"rawtext": [{"text": "§cYou need ${buyCost} Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}`);
            log(`Player ${player.nameTag} has insufficient Moneyz.`, LOG_LEVELS.INFO);
            return;
        }

        const giveCommand = buyData !== 0 ? `give @s ${String(itemName)} ${String(buyAmount)} ${String(buyData)}` : `give @s ${String(itemName)} ${String(buyAmount)}`;
        log("Give Command:", LOG_LEVELS.DEBUG, giveCommand);

        const giveResult = await player.runCommandAsync(giveCommand);
        log("Item given result:", LOG_LEVELS.DEBUG, giveResult);

        const removeMoneyResult = await updateScore(player, -buyCost);
        log("Moneyz removed result:", LOG_LEVELS.DEBUG, removeMoneyResult);

        if (!removeMoneyResult) {
            log("Error removing Moneyz.", LOG_LEVELS.ERROR);
            player.sendMessage("§cThere was an error removing your Moneyz. Please contact an admin.");
            return;
        }

        await player.runCommandAsync(`playsound random.levelup @s ~ ~ ~`);
        await player.runCommandAsync(`tell @s §aPurchased ${String(buyAmount)} ${String(itemName)} for ${String(buyCost)} Moneyz.`);
        log(`${player.nameTag} bought ${String(buyAmount)} ${String(itemName)} for ${String(buyCost)} Moneyz.`, LOG_LEVELS.INFO);
    } catch (error) {
        log("Error in handleBuy:", LOG_LEVELS.ERROR, error);
        player.sendMessage("§cError processing purchase. Check logs.");
    }
}

async function handleSell(player, shopItem) {
    log("Shop Item in handleSell:", LOG_LEVELS.DEBUG, JSON.stringify(shopItem, null, 2));

    const { itemName, sellAmount, sellCost, sellData } = shopItem;

    try {
        if (!player || typeof player.runCommandAsync !== 'function') {
            log("Error: player is invalid.", LOG_LEVELS.ERROR);
            return;
        }

        const hasItemCheck = sellData !== 0
            ? `@s[hasitem={item=${itemName},data=${sellData},quantity=${sellAmount}..}]`
            : `@s[hasitem={item=${itemName},quantity=${sellAmount}..}]`;

        const hasNoItemCheck = sellData !== 0
            ? `@s[hasitem={item=${itemName},data=${sellData},quantity=!${sellAmount}..}]`
            : `@s[hasitem={item=${itemName},quantity=!${sellAmount}..}]`;

        const soundCommand = `execute as ${hasItemCheck} run playsound random.levelup @s ~ ~ ~`;
        const giveMoneyCommand = `execute as ${hasItemCheck} run scoreboard players add @s Moneyz ${sellCost}`;
        const successMessageCommand = `execute as ${hasItemCheck} run tell @s §aSold ${sellAmount} ${itemName} for ${sellCost} Moneyz!`;
        const clearItemCommand = `execute as ${hasItemCheck} run clear @s ${itemName} ${sellData !== 0 ? sellData : 0} ${sellAmount}`;

        const noItemSound = `execute as ${hasNoItemCheck} run playsound note.bassattack @s ~ ~ ~`;
        const noItemMessage = `execute as ${hasNoItemCheck} run tell @s §cYou don't have enough ${itemName} to sell.`;

        try {
            await player.runCommandAsync(noItemSound);
            await player.runCommandAsync(noItemMessage);
            await player.runCommandAsync(soundCommand);
            await player.runCommandAsync(giveMoneyCommand);
            await player.runCommandAsync(successMessageCommand);
            await player.runCommandAsync(clearItemCommand);

            log(`${player.nameTag} attempted to sell ${sellAmount} ${itemName}.`, LOG_LEVELS.INFO);

        } catch (error) {
            log("Error in handleSell:", LOG_LEVELS.ERROR, error);
            player.sendMessage("§cError processing sell. Check logs.");
        }

    } catch (error) {
        log("Outer Error in handleSell:", LOG_LEVELS.ERROR, error);
        player.sendMessage("§cError processing sell. Check logs.");
    }
}
