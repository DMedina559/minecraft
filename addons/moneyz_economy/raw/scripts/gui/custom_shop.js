import { world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { main } from "./moneyz_menu.js";
import { getScore, updateScore } from "../utilities.js";
import { log, LOG_LEVELS } from "../logger.js";

const SHOP_WORLD_PROPERTY_PREFIX = "shopItem_";

export async function customShop(player, isNpcInteraction) {
    if (!player) return;

    const shopName = world.getDynamicProperty("customShop") || "Custom Shop";

    try {
        const shopItems = await getShopItemsFromWorldProperties();

        if (!Array.isArray(shopItems) || shopItems.length === 0) {
            player.sendMessage("§cNo shop items available.");
            return;
        }

        const form = new ActionFormData();
        form.title(`§l§1${shopName}`);

        shopItems.forEach(shopItem => {
            const displayName = shopItem.buyAmount && shopItem.itemName && shopItem.buyCost
                ? `§d§l${shopItem.buyAmount} ${shopItem.itemName}\n${shopItem.buyCost} Moneyz`
                : "§cInvalid Item";
            form.button(displayName);
        });

        form.button("§c§lBack");

        const response = await form.show(player);
        if (response.canceled) return;

        const selection = response.selection;

        if (selection >= 0 && selection < shopItems.length) {
            await handleShopItemMenu(player, shopItems[selection], isNpcInteraction);
        } else if (selection === shopItems.length && !isNpcInteraction) {
            main(player);
        }
    } catch (error) {
        log(`Error in customShop: ${error}`, LOG_LEVELS.ERROR);
        player.sendMessage("§cAn error occurred while opening the Custom Shop.");
    }
}

async function getShopItemsFromWorldProperties() {
    const shopItems = [];
    const properties = world.getDynamicPropertyIds().filter(id => id.startsWith(SHOP_WORLD_PROPERTY_PREFIX));

    for (const key of properties) {
        const shopString = world.getDynamicProperty(key);
        if (typeof shopString === "string") {
            const shopItem = parseShopItem(shopString);
            if (shopItem) shopItems.push(shopItem);
        }
    }
    return shopItems;
}

function parseShopItem(shopString) {
    try {
        const [itemName, buyAmount, buyCost, buyData, sellAmount, sellCost, sellData] = shopString.split(",");
        return {
            itemName,
            buyAmount: parseInt(buyAmount || "0", 10),
            buyCost: parseInt(buyCost || "0", 10),
            buyData: parseInt(buyData || "0", 10),
            sellAmount: parseInt(sellAmount || "0", 10),
            sellCost: parseInt(sellCost || "0", 10),
            sellData: parseInt(sellData || "0", 10),
        };
    } catch (error) {
        log(`Error parsing shop item: ${shopString}`, LOG_LEVELS.ERROR);
        return null;
    }
}

async function handleShopItemMenu(player, shopItem, isNpcInteraction) {
    const form = new ActionFormData();
    form.title(`Shop: ${shopItem.itemName}`);
    form.button(`Buy ${shopItem.buyAmount} for ${shopItem.buyCost} Moneyz`);
    form.button(`Sell ${shopItem.sellAmount} for ${shopItem.sellCost} Moneyz`);
    form.button("Back");

    try {
        const response = await form.show(player);
        if (response.canceled) return;

        const selection = response.selection;

        if (selection === 0) {
            await handleBuy(player, shopItem);
        } else if (selection === 1) {
            await handleSell(player, shopItem);
        } else {
            await customShop(player, isNpcInteraction);
        }
    } catch (error) {
        log(`Error showing Shop Item Menu: ${error}`, LOG_LEVELS.ERROR);
        player.sendMessage("§cAn error occurred.");
    }
}

async function handleBuy(player, shopItem) {
    const { itemName, buyAmount, buyCost, buyData } = shopItem;

    try {
        const playerMoney = getScore("Moneyz", player);

        if (isNaN(playerMoney) || playerMoney < buyCost) {
            try { player.playSound("note.bass"); } catch {}
            player.sendMessage(`§cYou need ${buyCost} Moneyz to buy ${buyAmount} ${itemName}!\n§6You have ${playerMoney} Moneyz`);
            return;
        }

        const giveCommand = buyData !== 0 ? `give @s ${itemName} ${buyAmount} ${buyData}` : `give @s ${itemName} ${buyAmount}`;
        await player.runCommandAsync(giveCommand);

        updateScore(player, buyCost, "remove");

        try { player.playSound("random.levelup"); } catch {}
        player.sendMessage(`§aPurchased ${buyAmount} ${itemName} for ${buyCost} Moneyz.`);
    } catch (error) {
        log(`Error in handleBuy: ${error}`, LOG_LEVELS.ERROR);
        player.sendMessage("§cError processing purchase.");
    }
}

async function handleSell(player, shopItem) {
    const { itemName, sellAmount, sellCost, sellData } = shopItem;

    try {
        const hasItemCheck = `testfor @s[hasitem={item=${itemName},data=${sellData},quantity=${sellAmount}..}]`;
        const testResult = await player.runCommandAsync(hasItemCheck);

        if (testResult.successCount > 0) {
            updateScore(player, sellCost, "add");

            const clearCommand = `clear @s ${itemName} ${sellData} ${sellAmount}`;
            await player.runCommandAsync(clearCommand);

            try { player.playSound("random.levelup"); } catch {}
            player.sendMessage(`§aSold ${sellAmount} ${itemName} for ${sellCost} Moneyz!`);
        } else {
            try { player.playSound("note.bass"); } catch {}
            player.sendMessage(`§cYou don't have enough ${itemName} to sell.`);
        }
    } catch (error) {
        log(`Error in handleSell: ${error}`, LOG_LEVELS.ERROR);
        try { player.playSound("note.bass"); } catch {}
        player.sendMessage(`§cYou don't have enough ${itemName} to sell.`);
    }
}
