import { ActionFormData } from "@minecraft/server-ui";
import { getScore, updateScore } from '../utilities.js';
import { log, LOG_LEVELS } from "../logger.js";
import { itemData } from "../item_data.js";

// The main entry point from moneyz_menu.js is now showShopCategories.
// The original mainShop function was removed as its logic is now handled in moneyz_menu.js.

export async function showShopCategories(player, shopId, isNpcInteraction) {
    const shop = itemData[shopId];
    if (!shop) {
        log(`Shop with id "${shopId}" not found.`, LOG_LEVELS.WARN);
        player.sendMessage("§cError: Shop not found.");
        return;
    }
    const categoryIds = Object.keys(shop);
    const shopDisplayName = shopId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const form = new ActionFormData();
    form.title(`§l§1${shopDisplayName}`);
    
    const categoryDisplayNames = categoryIds.map(id => id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    categoryDisplayNames.forEach(name => form.button(name));
    form.button("§c§lBack");

    try {
        const response = await form.show(player);
        if (response.isCanceled) return;

        const selection = response.selection;
        if (selection < categoryIds.length) {
            const selectedCategoryId = categoryIds[selection];
            await showCategoryItems(player, shopId, selectedCategoryId, isNpcInteraction);
        } else {
            // The "Back" button was pressed. The form will simply close, and the user
            // will need to re-open the shops menu if they wish. This is handled by moneyz_menu.js.
        }
    } catch (error) {
        log(`Error in showShopCategories: ${error}`, LOG_LEVELS.ERROR, error.stack);
        player.sendMessage("§cAn error occurred while opening the category menu.");
    }
}

async function showCategoryItems(player, shopId, categoryId, isNpcInteraction) {
    const items = itemData[shopId][categoryId];
    const categoryDisplayName = categoryId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const form = new ActionFormData();
    form.title(`§l§1${categoryDisplayName}`);

    items.forEach(item => {
        const buyText = item.buyPrice >= 0 ? `Buy: ${item.buyPrice}` : "Not for sale";
        const sellText = item.sellPrice >= 0 ? `Sell: ${item.sellPrice}` : "Cannot be sold";
        const buttonText = `§d§l${item.amount} ${item.name}\n§r${buyText} | ${sellText}`;

        // Attempt to construct a texture path. This works for most vanilla items.
        const iconId = item.id.startsWith("minecraft:") ? item.id.substring(10) : item.id;
        // A simple heuristic for items vs blocks. This is not perfect but covers many cases.
        const folder = (iconId.includes("_block") || iconId.includes("planks") || iconId.includes("log") || iconId.includes("stone") || iconId.includes("dirt")) ? "blocks" : "items";
        const iconPath = `textures/${folder}/${iconId}`;

        form.button(buttonText);//, iconPath);
    });
    form.button("§c§lBack");

    try {
        const response = await form.show(player);
        if (response.isCanceled) return;
        
        const selection = response.selection;
        if (selection < items.length) {
            const selectedItem = items[selection];
            await handleShopItemMenu(player, selectedItem, shopId, categoryId, isNpcInteraction);
        } else {
            await showShopCategories(player, shopId, isNpcInteraction); // Back button
        }
    } catch (error) {
        log(`Error in showCategoryItems: ${error}`, LOG_LEVELS.ERROR, error.stack);
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

    log(`Displaying shop item menu for ${item.name}.`, LOG_LEVELS.DEBUG);

    try {
        const response = await form.show(player);
        if (response.isCanceled) return;

        const selection = response.selection;
        log(`Player ${player.nameTag} selected option: ${selection}`, LOG_LEVELS.DEBUG);
        
        // This logic needs to be careful because buttons might not exist
        let action = null;
        if (item.buyPrice >= 0 && item.sellPrice >= 0) { // Both buttons exist
            action = selection === 0 ? 'buy' : (selection === 1 ? 'sell' : 'back');
        } else if (item.buyPrice >= 0) { // Only buy exists
            action = selection === 0 ? 'buy' : 'back';
        } else if (item.sellPrice >= 0) { // Only sell exists
            action = selection === 0 ? 'sell' : 'back';
        }

        if (action === 'buy') {
            await handleBuy(player, item);
        } else if (action === 'sell') {
            await handleSell(player, item);
        } else { // 'back' or any other case
            log(`Player ${player.nameTag} went back from item menu.`, LOG_LEVELS.DEBUG);
            await showCategoryItems(player, shopId, categoryId, isNpcInteraction);
        }
    } catch (error) {
        log("Error showing Shop Item Menu:", LOG_LEVELS.ERROR, error.stack);
        player.sendMessage("§cAn error occurred in the item menu.");
    }
}

async function handleBuy(player, item) {
    log("Item in handleBuy:", LOG_LEVELS.DEBUG, JSON.stringify(item, null, 2));
    const { id: itemId, name: itemName, amount: buyAmount, buyPrice: buyCost, buyDamage: buyData } = item;
    log(`Attempting to buy ${buyAmount} ${itemName} for ${buyCost} Moneyz.`, LOG_LEVELS.DEBUG);

    try {
        const playerMoney = getScore("Moneyz", player);
        if (isNaN(playerMoney) || playerMoney < buyCost) {
            player.playSound("note.bass");
            player.sendMessage(`§cYou need ${buyCost} Moneyz to buy ${buyAmount} ${itemName}.\n§6You have ${playerMoney} Moneyz`);
            log(`Player ${player.nameTag} has insufficient Moneyz.`, LOG_LEVELS.INFO);
            return;
        }

        // Using runCommand for give to handle item data values, which is not easily done with modern APIs without a larger refactor.
        const giveCommand = buyData !== 0 ? `give @s ${itemId} ${buyAmount} ${buyData}` : `give @s ${itemId} ${buyAmount}`;
        player.runCommand(giveCommand);
        
        updateScore(player, buyCost, "remove");

        player.playSound("random.levelup");
        player.sendMessage(`§aPurchased ${buyAmount} ${itemName} for ${buyCost} Moneyz.`);
        log(`${player.nameTag} bought ${buyAmount} ${itemName} for ${buyCost} Moneyz.`, LOG_LEVELS.INFO);
    } catch (error) {
        log("Error in handleBuy:", LOG_LEVELS.ERROR, error.stack);
        player.sendMessage("§cError processing purchase.");
    }
}

async function handleSell(player, item) {
    log("Item in handleSell:", LOG_LEVELS.DEBUG, JSON.stringify(item, null, 2));
    const { id: itemId, name: itemName, amount: sellAmount, sellPrice: sellCost, sellDamage: sellData } = item;

    try {
        // The `hasitem` selector is the most reliable way to check for items with specific data values.
        const hasItemCheck = `testfor @s[hasitem={item=${itemId},data=${sellData},quantity=${sellAmount}..}]`;
        const testResult = world.getDimension(player.dimension.id).runCommand(hasItemCheck);

        if (testResult.successCount > 0) {
            // Player has the item, proceed with selling
            updateScore(player, sellCost, "add");
            
            const clearCommand = `clear @s ${itemId} ${sellData} ${sellAmount}`;
            player.runCommand(clearCommand);

            player.playSound("random.levelup");
            player.sendMessage(`§aSold ${sellAmount} ${itemName} for ${sellCost} Moneyz!`);
            log(`${player.nameTag} sold ${sellAmount} ${itemName}.`, LOG_LEVELS.INFO);
        } else {
            // Player does not have the item
            player.playSound("note.bass");
            player.sendMessage(`§cYou don't have ${sellAmount} ${itemName} to sell.`);
            log(`${player.nameTag} failed to sell ${sellAmount} ${itemName}.`, LOG_LEVELS.INFO);
        }
    } catch (error) {
        log("Error in handleSell:", LOG_LEVELS.ERROR, error.stack);
        player.sendMessage("§cError processing sell transaction.");
    }
}
