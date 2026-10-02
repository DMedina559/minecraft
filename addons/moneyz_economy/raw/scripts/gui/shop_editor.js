import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getShopData, SHOP_DATA_PREFIX, saveShop, deleteShop } from "../data_provider.js";
import { log, LOG_LEVELS } from "../logger.js";
import { moneyzAdmin } from "./admin_menu.js";

export function showShopEditorMenu(player) {
    if (!player) return;

    const form = new ActionFormData()
        .title("§l§1Shop Editor")
        .body("§oManage your world's shops.")
        .button("Create New Shop")
        .button("Edit Existing Shop")
        .button("Remove Shop")
        .button("§c§lBack");

    form.show(player).then(r => {
        if (r.canceled) return;
        switch (r.selection) {
            case 0: createNewShop(player); break;
            case 1: editShop_selectShop(player); break;
            case 2: removeShop(player); break;
            case 3: moneyzAdmin(player); break;
        }
    });
}

function editShop_selectCategoryForEdit(player, shopId) {
    const shopData = getShopData();
    const shop = shopData[shopId] || {};
    const categoryIds = Object.keys(shop);

    if (categoryIds.length === 0) {
        player.sendMessage(`§cShop "${shopId}" has no categories with items to edit.`);
        editShop_selectAction(player, shopId);
        return;
    }

    const form = new ActionFormData()
        .title(`Edit Item in: ${shopId}`)
        .body("Select a category to edit an item from.");

    categoryIds.forEach(id => form.button(id.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())));
    form.button("§c§lBack");

    form.show(player).then(r => {
        if (r.canceled || r.selection === categoryIds.length) {
            editShop_selectAction(player, shopId);
            return;
        }
        editShop_selectItemForEdit(player, shopId, categoryIds[r.selection]);
    });
}

function editShop_selectItemForEdit(player, shopId, categoryId) {
    const shopData = getShopData();
    const items = shopData[shopId]?.[categoryId] || [];

    if (items.length === 0) {
        player.sendMessage(`§cCategory "${categoryId}" has no items to edit.`);
        editShop_selectCategoryForEdit(player, shopId);
        return;
    }

    const form = new ActionFormData()
        .title(`Edit Item in: ${categoryId}`)
        .body("Select an item to edit.");

    items.forEach(item => form.button(item.name));
    form.button("§c§lBack");

    form.show(player).then(r => {
        if (r.canceled || r.selection === items.length) {
            editShop_selectCategoryForEdit(player, shopId);
            return;
        }
        editShop_itemForm(player, shopId, categoryId, r.selection);
    });
}

function editShop_selectCategoryForAdd(player, shopId) {
    const shopData = getShopData();
    const shop = shopData[shopId] || {};
    const categoryIds = Object.keys(shop);

    const form = new ActionFormData()
        .title(`Add Item to: ${shopId}`)
        .body("Select a category to add the item to, or create a new one.");

    categoryIds.forEach(id => form.button(id.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())));
    form.button("§aCreate New Category");
    form.button("§c§lBack");

    form.show(player).then(r => {
        if (r.canceled || r.selection === categoryIds.length + 1) {
            editShop_selectAction(player, shopId);
            return;
        }

        if (r.selection < categoryIds.length) {
            editShop_itemForm(player, shopId, categoryIds[r.selection], -1);
        } else {
            editShop_createNewCategory(player, shopId);
        }
    });
}

function editShop_createNewCategory(player, shopId) {
    const form = new ModalFormData()
        .title("Create New Category")
        .textField("Enter a new Category ID\n(e.g., 'potions', no spaces, lowercase)", "category_id");

    form.show(player).then(r => {
        if (r.canceled) {
            editShop_selectCategoryForAdd(player, shopId);
            return;
        }

        const newCategoryId = String(r.formValues[0] || "").trim();
        const shopData = getShopData();

        if (!newCategoryId || /\s/.test(newCategoryId) || newCategoryId !== newCategoryId.toLowerCase()) {
            player.sendMessage("§cInvalid Category ID. Must not contain spaces or uppercase letters.");
            editShop_selectCategoryForAdd(player, shopId);
            return;
        }

        if (shopData[shopId]?.[newCategoryId]) {
            player.sendMessage(`§cCategory with ID "${newCategoryId}" already exists.`);
            editShop_selectCategoryForAdd(player, shopId);
            return;
        }

        if (!shopData[shopId]) shopData[shopId] = {};
        shopData[shopId][newCategoryId] = [];
        editShop_itemForm(player, shopId, newCategoryId, -1);
    });
}

function editShop_itemForm(player, shopId, categoryId, itemIndexToEdit = -1) {
    const shopData = getShopData();
    const isEditing = itemIndexToEdit >= 0;
    const item = isEditing ? (shopData[shopId]?.[categoryId]?.[itemIndexToEdit] || {}) : {};

    const form = new ModalFormData()
        .title(isEditing ? `Edit: ${item.name}` : "Add New Item")
        .textField("Item ID (e.g., minecraft:stone)", "minecraft:item_id", { defaultValue: item.id || "" })
        .textField("Display Name (e.g., Stone)", "Item Name", { defaultValue: item.name || "" })
        .textField("Amount", "1", { defaultValue: String(item.amount || 1) })
        .textField("Buy Price (-1 to disable)", "100", { defaultValue: String(item.buyPrice || 0) })
        .textField("Sell Price (-1 to disable)", "50", { defaultValue: String(item.sellPrice || 0) })
        .textField("Buy Damage Value", "0", { defaultValue: String(item.buyDamage || 0) })
        .textField("Sell Damage Value", "0", { defaultValue: String(item.sellDamage || 0) })
        .textField("Custom Icon Path (optional)", "textures/items/custom", { defaultValue: item.iconPath || "" });

    form.show(player).then(r => {
        if (r.canceled) {
            editShop_selectAction(player, shopId);
            return;
        }

        const [id, name, amount, buyPrice, sellPrice, buyDamage, sellDamage, iconPath] = r.formValues;

        const itemId = String(id || "").trim();
        const itemName = String(name || "").trim();

        if (!itemId || !itemName) {
            player.sendMessage("§cItem ID and Display Name are required.");
            editShop_itemForm(player, shopId, categoryId, itemIndexToEdit);
            return;
        }

        const newItemData = {
            id: itemId,
            name: itemName,
            amount: parseInt(amount, 10) || 1,
            buyPrice: parseInt(buyPrice, 10) || 0,
            sellPrice: parseInt(sellPrice, 10) || 0,
            buyDamage: parseInt(buyDamage, 10) || 0,
            sellDamage: parseInt(sellDamage, 10) || 0,
            iconPath: String(iconPath || "").trim() || undefined,
        };

        const shopToUpdate = shopData[shopId] || {};
        if (!shopToUpdate[categoryId]) shopToUpdate[categoryId] = [];

        if (isEditing) {
            shopToUpdate[categoryId][itemIndexToEdit] = newItemData;
        } else {
            shopToUpdate[categoryId].push(newItemData);
        }

        saveShop(shopId, shopToUpdate);
        player.sendMessage(`§aSuccessfully ${isEditing ? "updated" : "added"} item: "${newItemData.name}"`);

        editShop_selectAction(player, shopId);
    });
}

function editShop_selectItemForRemove(player, shopId, categoryId) {
    const shopData = getShopData();
    const items = shopData[shopId]?.[categoryId] || [];

    if (items.length === 0) {
        player.sendMessage(`§cCategory "${categoryId}" has no items to remove.`);
        editShop_selectCategoryForRemove(player, shopId);
        return;
    }

    const form = new ActionFormData()
        .title(`Remove from: ${categoryId}`)
        .body("Select an item to remove.");

    items.forEach(item => form.button(item.name));
    form.button("§c§lBack");

    form.show(player).then(r => {
        if (r.canceled || r.selection === items.length) {
            editShop_selectCategoryForRemove(player, shopId);
            return;
        }

        const itemIndexToRemove = r.selection;
        const itemToRemove = items[itemIndexToRemove];

        new ActionFormData()
            .title("§cConfirm Deletion")
            .body(`Are you sure you want to permanently delete the item "${itemToRemove.name}"?`)
            .button("§4Confirm Delete")
            .button("§aCancel")
            .show(player)
            .then(confirmResult => {
                if (!confirmResult.canceled && confirmResult.selection === 0) {
                    const shopToUpdate = shopData[shopId];
                    shopToUpdate[categoryId].splice(itemIndexToRemove, 1);
                    if (shopToUpdate[categoryId].length === 0) delete shopToUpdate[categoryId];

                    saveShop(shopId, shopToUpdate);
                    player.sendMessage(`§aItem "${itemToRemove.name}" has been removed.`);
                }
                editShop_selectCategoryForRemove(player, shopId);
            });
    });
}

function editShop_selectCategoryForRemove(player, shopId) {
    const shopData = getShopData();
    const shop = shopData[shopId] || {};
    const categoryIds = Object.keys(shop);

    if (categoryIds.length === 0) {
        player.sendMessage(`§cShop "${shopId}" has no categories with items.`);
        editShop_selectAction(player, shopId);
        return;
    }

    const form = new ActionFormData()
        .title(`Remove Item from: ${shopId}`)
        .body("Select a category to remove an item from.");

    categoryIds.forEach(id => form.button(id.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())));
    form.button("§c§lBack");

    form.show(player).then(r => {
        if (r.canceled || r.selection === categoryIds.length) {
            editShop_selectAction(player, shopId);
            return;
        }
        editShop_selectItemForRemove(player, shopId, categoryIds[r.selection]);
    });
}

function editShop_selectShop(player) {
    const shopData = getShopData();
    const shopIds = Object.keys(shopData);

    if (shopIds.length === 0) {
        player.sendMessage("§cThere are no shops to edit.");
        showShopEditorMenu(player);
        return;
    }

    const form = new ActionFormData()
        .title("Edit Shop")
        .body("Select a shop to edit.");

    shopIds.forEach(id => form.button(id.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())));
    form.button("§c§lBack");

    form.show(player).then(r => {
        if (r.canceled || r.selection === shopIds.length) {
            showShopEditorMenu(player);
            return;
        }
        editShop_selectAction(player, shopIds[r.selection]);
    });
}

function editShop_selectAction(player, shopId) {
    const form = new ActionFormData()
        .title(`Editing: ${shopId}`)
        .body("What would you like to do?")
        .button("Add Item")
        .button("Edit Item")
        .button("Remove Item")
        .button("§c§lBack");

    form.show(player).then(r => {
        if (r.canceled || r.selection === 3) {
            editShop_selectShop(player);
            return;
        }
        if (r.selection === 0) editShop_selectCategoryForAdd(player, shopId);
        else if (r.selection === 1) editShop_selectCategoryForEdit(player, shopId);
        else if (r.selection === 2) editShop_selectCategoryForRemove(player, shopId);
    });
}

function removeShop(player) {
    const shopData = getShopData();
    const shopIds = Object.keys(shopData);

    if (shopIds.length === 0) {
        player.sendMessage("§cThere are no shops to remove.");
        showShopEditorMenu(player);
        return;
    }

    const form = new ActionFormData()
        .title("Remove Shop")
        .body("§cWarning: This action is permanent.");

    shopIds.forEach(id => form.button(id.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())));
    form.button("§c§lBack");

    form.show(player).then(r => {
        if (r.canceled || r.selection === shopIds.length) {
            showShopEditorMenu(player);
            return;
        }

        const shopIdToRemove = shopIds[r.selection];

        new ActionFormData()
            .title("§cConfirm Deletion")
            .body(`Are you sure you want to permanently delete the "${shopIdToRemove}" shop and all of its items?`)
            .button("§4Confirm Delete")
            .button("§aCancel")
            .show(player)
            .then(confirmResult => {
                if (!confirmResult.canceled && confirmResult.selection === 0) {
                    deleteShop(shopIdToRemove);
                    player.sendMessage(`§aShop "${shopIdToRemove}" has been removed.`);
                }
                showShopEditorMenu(player);
            });
    });
}

function createNewShop(player) {
    new ModalFormData()
        .title("Create New Shop")
        .textField("Enter a new Shop ID\n(e.g., 'potion_shop', no spaces, lowercase)", "shop_id")
        .show(player)
        .then(r => {
            if (r.canceled) {
                showShopEditorMenu(player);
                return;
            }

            const newShopId = String(r.formValues[0] || "").trim();
            const shopData = getShopData();

            if (!newShopId || /\s/.test(newShopId) || newShopId !== newShopId.toLowerCase()) {
                player.sendMessage("§cShop ID cannot be empty or contain spaces or uppercase letters.");
                showShopEditorMenu(player);
                return;
            }

            if (shopData[newShopId]) {
                player.sendMessage(`§cShop with ID "${newShopId}" already exists.`);
                showShopEditorMenu(player);
                return;
            }

            saveShop(newShopId, {});
            player.sendMessage(`§aSuccessfully created new shop: "${newShopId}"`);
            showShopEditorMenu(player);
        });
}

log("shop_editor.js loaded", LOG_LEVELS.DEBUG);
