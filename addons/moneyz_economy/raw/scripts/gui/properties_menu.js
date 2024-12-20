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
        .button(`§d§lManage World Properties\n§r§7[ Click to Manage ]`)
        .button(`§4§lBack`);

    form.show(player).then(r => {
        if (r.selection === 0) playerPropertiesMenu(player);
        if (r.selection === 1) worldPropertiesMenu(player);
        if (r.selection === 2) moneyzAdmin(player);
    });
}

function playerPropertiesMenu(player) {
    const players = [...world.getPlayers()].map(p => p.nameTag);

    new ModalFormData()
        .title("§l§fView or Modify Dynamic Properties")
        .dropdown("§oChoose a Player", players)
        .show(player)
        .then(({ formValues: [dropdown] }) => {
            const selectedPlayer = players[dropdown];
            const player = world.getPlayers().find(p => p.nameTag === selectedPlayer);

            if (!player) {
                 log(`${player.nameTag} tried to modify properties for non-existent player: ${selectedPlayer}`, LOG_LEVELS.WARN);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlayer not found!"}]}`);
                return;
            }

            new ActionFormData()
                .title(`§l§f${selectedPlayer} Dynamic Properties`)
                .body("§oWhat would you like to do?")
                .button("§d§lView Properties\n§r§7[ View ]")
                .button("§d§lModify Properties\n§r§7[ Modify ]")
                .button("§4§lBack")
                .show(player).then(r => {
                    if (r.selection === 0) viewPlayerProperties(player, selectedPlayer);
                    if (r.selection === 1) modifyPlayerProperties(player, selectedPlayer);
                    if (r.selection === 2) propertiesMenu(player);
                });
        });
}

function viewPlayerProperties(player, selectedPlayer) {
    log(`Opening View Player Properties for ${player.nameTag} viewing ${selectedPlayer}'s properties`, LOG_LEVELS.INFO);

    const targetPlayer = world.getPlayers().find(p => p.nameTag === selectedPlayer);

    if (!targetPlayer) {
        log(`Player ${selectedPlayer} not found.`, LOG_LEVELS.WARN, player.nameTag);
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlayer not found!"}]}`);
        playerPropertiesMenu(player);
        return;
    }

    const dynamicPropertyIds = targetPlayer.getDynamicPropertyIds();
    let propertyList = "§l§oDynamic Properties:\n\n";
    let foundProperties = false;

    dynamicPropertyIds.forEach(property => {
        const value = targetPlayer.getDynamicProperty(property);
        if (value !== undefined) {
            foundProperties = true;
            propertyList += `§f${property}: §7${value}\n`;
        }
    });

    if (!foundProperties) {
        propertyList += "§cNo properties found.\n";
    }

    new ActionFormData()
        .title(`§l§f${selectedPlayer} Properties`)
        .body(propertyList)
        .button("§4§lBack")
        .show(player)
        .then(r => {
            if (r.selection === 0) {
                playerPropertiesMenu(player);
            } else {
                log(`Unexpected selection in View Player Properties Menu for ${player.nameTag}`, LOG_LEVELS.WARN);
            }
        });
}

function modifyPlayerProperties(player, selectedPlayer) {

    new ModalFormData()
        .title(`§l§fModify ${selectedPlayer} Properties`)
        .textField("§fEnter Property Key:", "§oProperty Key")
        .textField("§fEnter Property Value:", "§oProperty Value")
        .show(player)
        .then(({ formValues: [keyField, valueField] }) => {
            if (keyField === undefined || valueField === undefined) {
                log(`${player.nameTag} canceled property modification`, LOG_LEVELS.INFO);
                playerPropertiesMenu(player, selectedPlayer);
                return;
            }

            const targetPlayer = world.getPlayers().find(p => p.nameTag === selectedPlayer);
            if (!targetPlayer) {
                log(`Player ${selectedPlayer} not found (modify properties).`, LOG_LEVELS.WARN, player.nameTag);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlayer not found!"}]}`);
                return;
            }

            // const trimmedKey = keyField.trim();
            // const trimmedValue = valueField.trim();

            if (keyField === "" || valueField === "") {
                log(`${player.nameTag} entered empty key or value for property modification`, LOG_LEVELS.WARN);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cBoth key and value must be provided!"}]}`);
                return;
            }

            targetPlayer.setDynamicProperty(keyField, valueField);
            log(`Admin set dynamic property ${keyField} to ${valueField} for ${selectedPlayer}`, LOG_LEVELS.INFO, player.nameTag);
            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aDynamic property ${keyField} has been set to ${valueField} for ${selectedPlayer}."}]}`);
        })
        .catch(error => {
            log(`Error with ModalFormData in modifyPlayerProperties: ${error}`, LOG_LEVELS.ERROR, player.nameTag, error, error.stack);
            playerPropertiesMenu(player, selectedPlayer);
        });
}

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
        .then(({ formValues: [keyField, valueField] }) => {
            if (keyField === undefined || valueField === undefined) {
                log(`${player.nameTag} canceled world property modification.`, LOG_LEVELS.INFO);
                worldPropertiesMenu(player);
                return;
            }

            const trimmedKey = keyField.trim();
            const trimmedValue = valueField.trim();

            if (trimmedKey === "" || trimmedValue === "") {
                log(`${player.nameTag} entered empty key or value for world property modification.`, LOG_LEVELS.WARN);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cBoth key and value must be provided!"}]}`);
                return;
            }

            world.setDynamicProperty(trimmedKey, trimmedValue);
            log(`World property ${trimmedKey} set to ${trimmedValue} by ${player.nameTag}.`, LOG_LEVELS.INFO);
            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aWorld property ${trimmedKey} has been set to ${trimmedValue}."}]}`);
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