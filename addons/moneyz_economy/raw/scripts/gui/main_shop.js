import { ActionFormData } from "@minecraft/server-ui";
import { getScore, updateScore } from "../utilities.js";
import { log, LOG_LEVELS } from "../logger.js";
import { getShopData } from "../data_provider.js";

export async function showShopCategories(player, shopId, isNpcInteraction) {
    const shopData = getShopData();
    const shop = shopData[shopId];
    if (!shop) {
        log(`Shop with id "${shopId}" not found.`, LOG_LEVELS.WARN);
        player.sendMessage("§cError: Shop not found.");
        return;
    }
    const categoryIds = Object.keys(shop);
    const shopDisplayName = shopId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

    const form = new ActionFormData();
    form.title(`§l§1${shopDisplayName}`);

    const categoryDisplayNames = categoryIds.map(id => id.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()));
    categoryDisplayNames.forEach(name => form.button(name));
    form.button("§c§lBack");

    try {
        const response = await form.show(player);
        if (response.canceled) return;

        const selection = response.selection;
        if (selection < categoryIds.length) {
            const selectedCategoryId = categoryIds[selection];
            await showCategoryItems(player, shopId, selectedCategoryId, isNpcInteraction);
        }
    } catch (error) {
        log(`Error in showShopCategories: ${error}`, LOG_LEVELS.ERROR);
        player.sendMessage("§cAn error occurred while opening the category menu.");
    }
}

async function showCategoryItems(player, shopId, categoryId, isNpcInteraction) {
    const shopData = getShopData();
    const items = shopData[shopId]?.[categoryId] || [];
    const categoryDisplayName = categoryId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

    const form = new ActionFormData();
    form.title(`§l§1${categoryDisplayName}`);

    items.forEach(item => {
        const buyText = item.buyPrice >= 0 ? `Buy: ${item.buyPrice}` : "Not for sale";
        const sellText = item.sellPrice >= 0 ? `Sell: ${item.sellPrice}` : "Cannot be sold";
        const buttonText = `§d§l${item.amount} ${item.name}\n§r${buyText} | ${sellText}`;

        let iconPath = item.iconPath;
        if (!iconPath) {
            const iconId = item.id.startsWith("minecraft:") ? item.id.substring(10) : item.id;
            const folder = (iconId.includes("_block") || iconId.includes("planks") || iconId.includes("log") || iconId.includes("stone") || iconId.includes("dirt")) ? "blocks" : "items";
            iconPath = `textures/${folder}/${iconId}`;
        }

        form.button(buttonText, iconPath);
    });
    form.button("§c§lBack");

    try {
        const response = await form.show(player);
        if (response.canceled) return;

        const selection = response.selection;
        if (selection < items.length) {
            const selectedItem = items[selection];
            await handleShopItemMenu(player, selectedItem, shopId, categoryId, isNpcInteraction);
        } else {
            await showShopCategories(player, shopId, isNpcInteraction);
        }
    } catch (error) {
        log(`Error in showCategoryItems: ${error}`, LOG_LEVELS.ERROR);
        player.sendMessage("§cAn error occurred while showing items.");
    }
}

async function handleShopItemMenu(player, item, shopId, categoryId, isNpcInteraction) {
    const form = new ActionFormData();
    form.title(item.name);

    if (item.buyPrice >= 0) {
        form.button(`Buy ${item.amount} for ${item.buyPrice} Moneyz`);
    }
    if (item.sellPrice >= 0) {
        form.button(`Sell ${item.amount} for ${item.sellPrice} Moneyz`);
    }
    form.button("Back");

    try {
        const response = await form.show(player);
        if (response.canceled) return;

        const selection = response.selection;
        let action = null;
        if (item.buyPrice >= 0 && item.sellPrice >= 0) {
            action = selection === 0 ? "buy" : (selection === 1 ? "sell" : "back");
        } else if (item.buyPrice >= 0) {
            action = selection === 0 ? "buy" : "back";
        } else if (item.sellPrice >= 0) {
            action = selection === 0 ? "sell" : "back";
        }

        if (action === "buy") {
            await handleBuy(player, item);
        } else if (action === "sell") {
            await handleSell(player, item);
        } else {
            await showCategoryItems(player, shopId, categoryId, isNpcInteraction);
        }
    } catch (error) {
        log(`Error showing Shop Item Menu: ${error}`, LOG_LEVELS.ERROR);
        player.sendMessage("§cAn error occurred in the item menu.");
    }
}

async function handleBuy(player, item) {
    const { id: itemId, name: itemName, amount: buyAmount, buyPrice: buyCost, buyDamage: buyData } = item;

    try {
        const playerMoney = getScore("Moneyz", player);
        if (isNaN(playerMoney) || playerMoney < buyCost) {
            try { player.playSound("note.bass"); } catch {}
            player.sendMessage(`§cYou need ${buyCost} Moneyz to buy ${buyAmount} ${itemName}.\n§6You have ${playerMoney} Moneyz`);
            return;
        }

        const giveCommand = buyData !== 0 ? `give @s ${itemId} ${buyAmount} ${buyData}` : `give @s ${itemId} ${buyAmount}`;
        await player.runCommandAsync(giveCommand);

        updateScore(player, buyCost, "remove");

        try { player.playSound("random.levelup"); } catch {}
        player.sendMessage(`§aPurchased ${buyAmount} ${itemName} for ${buyCost} Moneyz.`);
    } catch (error) {
        log(`Error in handleBuy: ${error}`, LOG_LEVELS.ERROR);
        player.sendMessage("§cError processing purchase.");
    }
}

async function handleSell(player, item) {
    const { id: itemId, name: itemName, amount: sellAmount, sellPrice: sellCost, sellDamage: sellData } = item;

    try {
        const hasItemCheck = `testfor @s[hasitem={item=${itemId},data=${sellData},quantity=${sellAmount}..}]`;
        const testResult = await player.runCommandAsync(hasItemCheck);

        if (testResult.successCount > 0) {
            updateScore(player, sellCost, "add");

            const clearCommand = `clear @s ${itemId} ${sellData} ${sellAmount}`;
            await player.runCommandAsync(clearCommand);

            try { player.playSound("random.levelup"); } catch {}
            player.sendMessage(`§aSold ${sellAmount} ${itemName} for ${sellCost} Moneyz!`);
        } else {
            try { player.playSound("note.bass"); } catch {}
            player.sendMessage(`§cYou don't have ${sellAmount} ${itemName} to sell.`);
        }
    } catch (error) {
        log(`Error in handleSell: ${error}`, LOG_LEVELS.ERROR);
        try { player.playSound("note.bass"); } catch {}
        player.sendMessage(`§cYou don't have ${sellAmount} ${itemName} to sell.`);
    }
}
