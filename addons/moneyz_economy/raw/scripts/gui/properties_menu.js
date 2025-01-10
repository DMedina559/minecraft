import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getScore, getCurrentUTCDate } from '../utilities.js';
import { moneyzAdmin } from './admin_menu.js';
import { log, LOG_LEVELS } from '../logger.js';

const title = "§l§1Properties Menu";

export function propertiesMenu(player) {
    const form = new ActionFormData()
        .title(title)
        .body(`§l§o§fManage World and Player Properties Here`)
        .button(`§d§lManage Player Properties\n§r§7[ Click to Manage ]`)
        .button(`§d§lManage Shop Properties\n§r§7[ Click to Manage ]`)
        .button(`§d§lManage World Properties\n§r§7[ Click to Manage ]`)
        .button(`§4§lBack`);

    form.show(player).then(r => {
        if (r.selection === 0) playerPropertiesMenu(player);
        if (r.selection === 1) shopItemPropertiesMenu(player);
        if (r.selection === 2) worldPropertiesMenu(player);
        if (r.selection === 3) moneyzAdmin(player);
    });
}

function playerPropertiesMenu(player) {
    log(`Player ${player.nameTag} opened the Player Properties Menu.`, LOG_LEVELS.DEBUG);

    const players = [...world.getPlayers()];
    const playerNames = players.map(p => p.nameTag);

    new ModalFormData()
        .title("§l§fView or Modify Dynamic Properties")
        .dropdown("§oChoose a Player", playerNames)
        .show(player)
        .then(({ formValues }) => {
            if (!formValues || formValues[0] === undefined) {
                log("Player Properties Menu (player select) closed or no player selected.", LOG_LEVELS.INFO, player.nameTag);
                return;
            }

            const dropdownIndex = formValues[0];

            if (dropdownIndex < 0 || dropdownIndex >= players.length) {
                log(`Invalid dropdown index: ${dropdownIndex}`, LOG_LEVELS.WARN, player.nameTag);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cInvalid player selected."}]}`);
                return;
            }

            const selectedPlayer = players[dropdownIndex];

            if (!selectedPlayer || !selectedPlayer.isValid()) {
                log(`Selected player is no longer valid or undefined.`, LOG_LEVELS.WARN, player.nameTag);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cSelected player is no longer available."}]}`);
                return;
            }

            new ActionFormData()
                .title(`§l§f${selectedPlayer.nameTag} Dynamic Properties`)
                .body("§oWhat would you like to do?")
                .button("§d§lView Properties\n§r§7[ View ]")
                .button("§d§lModify Properties\n§r§7[ Modify ]")
                .button("§4§lBack")
                .show(player)
                .then(r => {
                    if (!r || r.selection === undefined) {
                      log("Player Properties Menu (action select) closed.", LOG_LEVELS.INFO, player.nameTag);
                      return;
                    }

                    if (r.selection === 0) viewPlayerProperties(player, selectedPlayer);
                    if (r.selection === 1) modifyPlayerProperties(player, selectedPlayer);
                    if (r.selection === 2) propertiesMenu(player);
                })
                .catch(err => {
                    log(`Error in ActionFormData (action select): ${err}`, LOG_LEVELS.ERROR, err.stack);
                });
        })
        .catch(err => {
            log(`Error in ModalFormData (player select): ${err}`, LOG_LEVELS.ERROR, err.stack);
        });
}

function viewPlayerProperties(player, selectedPlayer) {
    log(`Opening View Player Properties for ${player.nameTag} viewing ${selectedPlayer.nameTag}'s properties`, LOG_LEVELS.INFO);

    if (!selectedPlayer || !selectedPlayer.isValid()) {
        log(`Selected player is no longer valid.`, LOG_LEVELS.WARN, player.nameTag);
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cSelected player is no longer available."}]}`);
        playerPropertiesMenu(player);
        return;
    }

    const dynamicPropertyIds = selectedPlayer.getDynamicPropertyIds();
    let propertyList = "§l§oDynamic Properties:\n\n";
    let hasProperties = false;

    dynamicPropertyIds.forEach(property => {
        const value = selectedPlayer.getDynamicProperty(property);
        if (value !== undefined) {
            hasProperties = true;
            propertyList += `§f${property}: §7${value}\n`;
        }
    });

    if (!hasProperties) {
        propertyList += "§cNo properties found.\n";
    }

    new ActionFormData()
        .title(`§l§f${selectedPlayer.nameTag} Properties`)
        .body(propertyList)
        .button("§4§lBack")
        .show(player)
        .then(r => {
            if (!r || r.selection === undefined) {
                log("View Player Properties Menu closed.", LOG_LEVELS.INFO, player.nameTag);
                return;
            }
            if (r.selection === 0) {
                playerPropertiesMenu(player);
            } else {
                log(`Unexpected selection in View Player Properties Menu for ${player.nameTag}`, LOG_LEVELS.WARN);
            }
        })
        .catch(err => {
            log(`Error in ActionFormData: ${err}`, LOG_LEVELS.ERROR, err.stack);
        });
}

function modifyPlayerProperties(player, selectedPlayer) {
    if (!selectedPlayer || !selectedPlayer.isValid()) {
        log(`Selected player is no longer valid (modify properties).`, LOG_LEVELS.WARN, player.nameTag);
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cSelected player is no longer available."}]}`);
        playerPropertiesMenu(player);
        return;
    }

    new ModalFormData()
        .title(`§l§fModify ${selectedPlayer.nameTag} Properties`)
        .textField("§fEnter Property Key:", "§oProperty Key")
        .textField("§fEnter Property Value:", "§oProperty Value")
        .show(player)
        .then(({ formValues }) => {
            if (!formValues || formValues.some(val => val === undefined)) {
                log(`${player.nameTag} canceled property modification.`, LOG_LEVELS.INFO);
                playerPropertiesMenu(player, selectedPlayer);
                return;
            }

            const [keyField, valueField] = formValues;

            if (keyField.trim() === "") {
                log(`${player.nameTag} entered empty key for property modification.`, LOG_LEVELS.WARN);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cA key must be provided!"}]}`);
                return;
            }

            if ( valueField.trim() === "") {
                log(`${player.nameTag} cleared ${keyField} property.`, LOG_LEVELS.INFO);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cProperty Cleared!"}]}`);
                selectedPlayer.setDynamicProperty(keyField.trim(), null);
                return;
            }

            selectedPlayer.setDynamicProperty(keyField.trim(), valueField.trim());
            log(`Admin set dynamic property ${keyField.trim()} to ${valueField.trim()} for ${selectedPlayer.nameTag}`, LOG_LEVELS.INFO, player.nameTag);
            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aDynamic property ${keyField.trim()} has been set to ${valueField.trim()} for ${selectedPlayer.nameTag}."}]}`);
        })
        .catch(error => {
            log(`Error with ModalFormData in modifyPlayerProperties: ${error}`, LOG_LEVELS.ERROR, player.nameTag, error, error.stack);
            playerPropertiesMenu(player, selectedPlayer);
        });
}

function shopItemPropertiesMenu(player) {
    const worldProperties = world.getDynamicPropertyIds().filter(id => id.startsWith('shopItem_'));
    
    const propertyList = worldProperties.map(property => {
        const value = world.getDynamicProperty(property);
        return `§f${property} §7-> §f${value}`;
    });
    
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
            if (!result || !result.formValues) {
                log(`${player.nameTag} canceled Custom Item.`, LOG_LEVELS.INFO);
                return;
            }

            const formValues = result.formValues;
            const selectedOption = formValues[0];
            const propertyName = (formValues[1] || "").trim();
            const itemName = (formValues[2] || "").trim();
            const buyAmount = parseInt(formValues[3] || "0", 10);
            const buyCost = parseInt(formValues[4] || "0", 10);
            const buyData = parseInt(formValues[5] || "0", 10);
            const sellAmount = parseInt(formValues[6] || "0", 10);
            const sellCost = parseInt(formValues[7] || "0", 10);
            const sellData = parseInt(formValues[8] || "0", 10);

            if (selectedOption === options.length - 1) {
                if (!propertyName || !propertyName.startsWith("shopItem_")) {
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cProperty name must start with 'shopItem_'."}]}`);
                    return;
                }

                const newValue = `${itemName},${buyAmount},${buyCost},${buyData},${sellAmount},${sellCost},${sellData}`;
                world.setDynamicProperty(propertyName, newValue);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aNew property '${propertyName}' has been created."}]}`);

            } else if (selectedOption >= 0 && selectedOption < worldProperties.length) {
                const existingProperty = worldProperties[selectedOption];
                const newValue = `${itemName},${buyAmount},${buyCost},${buyData},${sellAmount},${sellCost},${sellData}`;
                world.setDynamicProperty(existingProperty, newValue);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aProperty '${existingProperty}' has been updated."}]}`);
            } else {
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cInvalid selection."}]}`);
            }
        })
        .catch(error => {
          log(`Error in shopItemPropertiesMenu: ${error}`, LOG_LEVELS.ERROR, player.nameTag, error, error.stack);
          player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cAn error occurred while managing shop items."}]}`);
        });
};

function worldPropertiesMenu(player) {

    const worldProperties = world.getDynamicPropertyIds();

    let propertiesList = "§l§oWorld Properties:\n\n";
    if (worldProperties.length === 0) {
        propertiesList += "§cNo world properties found.";
        log("No world properties found.", LOG_LEVELS.INFO);
    } else {
        worldProperties.forEach(property => {
            const value = world.getDynamicProperty(property);
            if (value === undefined) {
                propertiesList += `§f${property}: §cundefined\n`;
                log(`World property ${property} is undefined.`, LOG_LEVELS.WARN);
            } else {
                propertiesList += `§f${property}: §7${value}\n`;
                log(`World property ${property}: ${value}`, LOG_LEVELS.DEBUG);
            }
        });
    }

    new ActionFormData()
        .title("§l§1World Properties Menu")
        .body(propertiesList)
        .button("§d§lModify Properties\n§r§7[ Modify World Properties ]")
        .button("§d§lClear Properties\n§r§7[ Clear ALL World Properties ]")
        .button("§4§lBack")
        .show(player)
        .then(r => {
            if (r.selection === 0) {
                modifyWorldProperties(player);
            } else if (r.selection === 1) {
                log(`${player.nameTag} selected Clear All World Properties.`, LOG_LEVELS.WARN);
                clearAllWorldProperties(player);
            } else if (r.selection === 2) {
                propertiesMenu(player);
            } else {
                log(`Unexpected selection in World Properties Menu: ${r.selection}`, LOG_LEVELS.WARN, player.nameTag);
            }
        });
}

function modifyWorldProperties(player) {
    new ModalFormData()
        .title("§l§fModify World Properties")
        .textField("§fEnter Property Key:", "§oProperty Key")
        .textField("§fEnter Property Value:", "§oProperty Value")
        .show(player)
        .then((result) => {
            if (!result || !result.formValues) {
                log(`${player.nameTag} canceled world property modification.`, LOG_LEVELS.INFO);
                worldPropertiesMenu(player);
                return;
            }

            const [keyField, valueField] = result.formValues;

            if (keyField.trim() === "") {
                log(`${player.nameTag} entered empty key for world property modification.`, LOG_LEVELS.WARN);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cA key must be provided!"}]}`);
                return;
            }
            if (valueField.trim() === "") {
                log(`${player.nameTag} cleared ${keyField.trim()} property.`, LOG_LEVELS.INFO);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cCleared property!"}]}`);
                world.setDynamicProperty(keyField.trim(), null);
                return;
            }

            try {
                world.setDynamicProperty(keyField.trim(), valueField.trim());
                log(`World property ${keyField.trim()} set to ${valueField.trim()} by ${player.nameTag}.`, LOG_LEVELS.INFO);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aWorld property ${keyField.trim()} has been set to ${valueField.trim()}."}]}`);
            } catch (error) {
                log(`Error setting world property: ${error}`, LOG_LEVELS.ERROR, player.nameTag, error, error.stack);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cAn error occurred while modifying the world property."}]}`);
            }
        })
        .catch(error => {
            log(`Error with ModalFormData in modifyWorldProperties: ${error}`, LOG_LEVELS.ERROR, player.nameTag, error, error.stack);
            worldPropertiesMenu(player);
        });
}

function clearAllWorldProperties(player) {
    log(`Clearing all world properties initiated by ${player.nameTag}.`, LOG_LEVELS.WARN);
    world.clearDynamicProperties();
    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aAll dynamic properties have been cleared successfully!"}]}`);
    log(`All world properties cleared by ${player.nameTag}.`, LOG_LEVELS.WARN);
    worldPropertiesMenu(player);
}

log('properties_menu.js loaded', LOG_LEVELS.DEBUG);