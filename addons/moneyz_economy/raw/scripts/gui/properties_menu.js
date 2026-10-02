import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "../ui/forms.js";
import { moneyzAdmin } from "./admin_menu.js";
import { log, LOG_LEVELS } from "../logger.js";

export function propertiesMenu(player) {
    if (!player) return;

    const form = new ActionFormData()
        .title("§l§1Properties Menu")
        .body("§l§o§fManage World and Player Properties Here")
        .button("§d§lManage Player Properties\n§r§7[ Click to Manage ]")
        .button("§d§lManage Shop Properties\n§r§7[ Click to Manage ]")
        .button("§d§lManage World Properties\n§r§7[ Click to Manage ]")
        .button("§c§lBack");

    form.show(player).then(r => {
        if (r.canceled) return;
        switch (r.selection) {
            case 0: playerPropertiesMenu(player); break;
            case 1: shopItemPropertiesMenu(player); break;
            case 2: worldPropertiesMenu(player); break;
            case 3: moneyzAdmin(player); break;
        }
    });
}

function playerPropertiesMenu(player) {
    const players = [...world.getPlayers()];
    const playerNames = players.map(p => p.nameTag);

    new ModalFormData()
        .title("§l§1View Player Dynamic Properties")
        .dropdown("§oChoose a Player", playerNames)
        .show(player)
        .then(({ formValues, canceled }) => {
            if (canceled || !formValues) {
                propertiesMenu(player);
                return;
            }

            const dropdownIndex = formValues[0];
            const selectedPlayer = players[dropdownIndex];

            if (!selectedPlayer?.isValid) {
                player.sendMessage("§cSelected player is no longer available.");
                propertiesMenu(player);
                return;
            }

            viewPlayerProperties(player, selectedPlayer);
        })
        .catch(() => propertiesMenu(player));
}

function viewPlayerProperties(player, selectedPlayer) {
    if (!selectedPlayer?.isValid) {
        player.sendMessage("§cSelected player is no longer available.");
        playerPropertiesMenu(player);
        return;
    }

    const dynamicPropertyIds = selectedPlayer.getDynamicPropertyIds();
    let propertyList = "§l§oDynamic Properties:\n\n";
    let hasProperties = false;

    dynamicPropertyIds.forEach(prop => {
        const val = selectedPlayer.getDynamicProperty(prop);
        if (val !== undefined) {
            hasProperties = true;
            propertyList += `§f${prop}: §7${val}\n`;
        }
    });

    if (!hasProperties) {
        propertyList += "§cNo properties found.\n";
    }

    new ActionFormData()
        .title(`§l§1${selectedPlayer.nameTag} Properties`)
        .body(propertyList)
        .button("§d§lModify")
        .button("§c§lBack")
        .show(player)
        .then(r => {
            if (r.canceled) return;
            if (r.selection === 0) modifyPlayerProperties(player, selectedPlayer);
            else if (r.selection === 1) playerPropertiesMenu(player);
        });
}

function modifyPlayerProperties(player, selectedPlayer) {
    if (!selectedPlayer?.isValid) {
        player.sendMessage("§cSelected player is no longer available.");
        playerPropertiesMenu(player);
        return;
    }

    const playerPropertyIds = selectedPlayer.getDynamicPropertyIds();
    const options = playerPropertyIds.map(id => `§f${id}`).concat(["§aAdd New Property"]);

    new ModalFormData()
        .title(`§l§1${selectedPlayer.nameTag} Properties`)
        .dropdown("§oSelect Property or Add New", options)
        .textField("§fEnter Property Key (required for new):", "§oProperty Key")
        .textField("§fEnter Property Value (leave empty to remove):", "§oProperty Value")
        .show(player)
        .then(({ formValues, canceled }) => {
            if (canceled || !formValues) {
                playerPropertiesMenu(player);
                return;
            }

            const [selectedOption, keyField, valueField] = formValues;
            const keyStr = String(keyField || "").trim();
            const valStr = String(valueField || "").trim();

            if (selectedOption === options.length - 1) {
                if (!keyStr || !keyStr.startsWith("player_")) {
                    player.sendMessage("§cA key must be provided and start with 'player_'!");
                    modifyPlayerProperties(player, selectedPlayer);
                    return;
                }

                selectedPlayer.setDynamicProperty(keyStr, valStr);
                player.sendMessage(`§aDynamic property ${keyStr} has been set to ${valStr} for ${selectedPlayer.nameTag}.`);
                modifyPlayerProperties(player, selectedPlayer);
                return;
            }

            const selectedProperty = playerPropertyIds[selectedOption];

            if (valStr === "") {
                player.sendMessage("§cProperty Cleared!");
                selectedPlayer.setDynamicProperty(selectedProperty, null);
                modifyPlayerProperties(player, selectedPlayer);
                return;
            }

            selectedPlayer.setDynamicProperty(selectedProperty, valStr);
            player.sendMessage(`§aDynamic property ${selectedProperty} has been set to ${valStr} for ${selectedPlayer.nameTag}.`);
        })
        .catch(() => playerPropertiesMenu(player));
}

function shopItemPropertiesMenu(player) {
    const worldProperties = world.getDynamicPropertyIds().filter(id => id.startsWith("shopItem_"));
    const propertyList = worldProperties.map(prop => `§f${prop} §7-> §f${world.getDynamicProperty(prop)}`);
    const options = [...propertyList, "§aAdd New Property"];

    new ModalFormData()
        .title("§l§1Custom Items")
        .dropdown("§oSelect an Option", options)
        .textField("§fNew Property Name (required if adding new):", "shopItem_example")
        .textField("§fItem Name:", "minecraft:stone")
        .textField("§fBuy Amount:", "1")
        .textField("§fBuy Cost:", "100")
        .textField("§fBuy Data:", "0")
        .textField("§fSell Amount:", "1")
        .textField("§fSell Cost:", "50")
        .textField("§fSell Data:", "0")
        .show(player)
        .then(result => {
            if (!result || result.canceled || !result.formValues) return;

            const values = result.formValues;
            const selectedOption = values[0];
            const propertyName = String(values[1] || "").trim();
            const itemName = String(values[2] || "").trim();
            const buyAmount = parseInt(values[3] || "0", 10);
            const buyCost = parseInt(values[4] || "0", 10);
            const buyData = parseInt(values[5] || "0", 10);
            const sellAmount = parseInt(values[6] || "0", 10);
            const sellCost = parseInt(values[7] || "0", 10);
            const sellData = parseInt(values[8] || "0", 10);

            const newValue = `${itemName},${buyAmount},${buyCost},${buyData},${sellAmount},${sellCost},${sellData}`;

            if (selectedOption === options.length - 1) {
                if (!propertyName || !propertyName.startsWith("shopItem_")) {
                    player.sendMessage("§cProperty name must start with 'shopItem_'.");
                    return;
                }
                world.setDynamicProperty(propertyName, newValue);
                player.sendMessage(`§aNew property '${propertyName}' has been created.`);
            } else if (selectedOption >= 0 && selectedOption < worldProperties.length) {
                const existingProperty = worldProperties[selectedOption];
                world.setDynamicProperty(existingProperty, newValue);
                player.sendMessage(`§aProperty '${existingProperty}' has been updated.`);
            }
        })
        .catch(() => player.sendMessage("§cAn error occurred while managing shop items."));
}

function worldPropertiesMenu(player) {
    const worldProperties = world.getDynamicPropertyIds();

    let propertiesList = "§l§oWorld Properties:\n\n";
    if (worldProperties.length === 0) {
        propertiesList += "§cNo world properties found.";
    } else {
        worldProperties.forEach(prop => {
            const val = world.getDynamicProperty(prop);
            propertiesList += `§f${prop}: §7${val !== undefined ? val : "cundefined"}\n`;
        });
    }

    new ActionFormData()
        .title("§l§1World Properties Menu")
        .body(propertiesList)
        .button("§d§lModify Properties\n§r§7[ Modify World Properties ]")
        .button("§d§lClear Properties\n§r§7[ Clear ALL World Properties ]")
        .button("§c§lBack")
        .show(player)
        .then(r => {
            if (r.canceled) return;
            if (r.selection === 0) modifyWorldProperties(player);
            else if (r.selection === 1) clearAllWorldProperties(player);
            else if (r.selection === 2) propertiesMenu(player);
        });
}

function modifyWorldProperties(player) {
    const worldPropertyIds = world.getDynamicPropertyIds();
    const options = worldPropertyIds.map(id => `§f${id}`).concat(["§aAdd New Property"]);

    new ModalFormData()
        .title("§l§1Modify World Properties")
        .dropdown("§oSelect Property or Add New", options)
        .textField("§fEnter Property Key (required for new):", "§oProperty Key")
        .textField("§fEnter Property Value (leave empty to remove):", "§oProperty Value")
        .show(player)
        .then(({ formValues, canceled }) => {
            if (canceled || !formValues) {
                worldPropertiesMenu(player);
                return;
            }

            const [selectedOption, keyField, valueField] = formValues;
            const keyStr = String(keyField || "").trim();
            const valStr = String(valueField || "").trim();

            if (selectedOption === options.length - 1) {
                if (!keyStr) {
                    player.sendMessage("§cA key must be provided!");
                    return;
                }
                world.setDynamicProperty(keyStr, valStr);
                player.sendMessage(`§aWorld property ${keyStr} has been set to ${valStr}.`);
                modifyWorldProperties(player);
                return;
            }

            const selectedProperty = worldPropertyIds[selectedOption];

            if (valStr === "") {
                player.sendMessage("§cProperty Cleared!");
                world.setDynamicProperty(selectedProperty, null);
                modifyWorldProperties(player);
                return;
            }

            world.setDynamicProperty(selectedProperty, valStr);
            player.sendMessage(`§aWorld property ${selectedProperty} has been set to ${valStr}.`);
            modifyWorldProperties(player);
        })
        .catch(() => worldPropertiesMenu(player));
}

function clearAllWorldProperties(player) {
    world.clearDynamicProperties();
    player.sendMessage("§aAll dynamic properties have been cleared successfully!");
    worldPropertiesMenu(player);
}

log("properties_menu.js loaded", LOG_LEVELS.DEBUG);
