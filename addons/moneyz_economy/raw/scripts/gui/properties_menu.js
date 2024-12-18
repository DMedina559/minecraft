import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getScore, getCurrentUTCDate } from '../utilities.js';
import { moneyzAdmin } from './admin_menu.js';

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
                    if (r.selection === 1) propertiesMenu(player);
                });
        });
}

function viewPlayerProperties(player, selectedPlayer) {
    const targetPlayer = world.getPlayers().find(p => p.nameTag === selectedPlayer);

    if (!targetPlayer) {
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlayer not found!"}]}`);
        return;
        playerPropertiesMenu(player)
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
            if (r.selection === 0) playerPropertiesMenu(player);
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
                playerPropertiesMenu(player, selectedPlayer);
                return;
            }

            const targetPlayer = world.getPlayers().find(p => p.nameTag === selectedPlayer);
            if (!targetPlayer) {
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlayer not found!"}]}`);
                return;
            }

            if (keyField.trim() === "" || valueField.trim() === "") {
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cBoth key and value must be provided!"}]}`);
                return;
            }

            targetPlayer.setDynamicProperty(keyField, valueField);
            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aDynamic property ${keyField} has been set to ${valueField} for ${selectedPlayer}."}]}`);
            console.log(`Admin set dynamic property ${keyField} to ${valueField} for ${selectedPlayer}`);
        })
        .catch(error => {
            console.error("Error with ModalFormData:", error);
            playerPropertiesMenu(player, selectedPlayer);
        });
}

function worldPropertiesMenu(player) {
    const worldProperties = world.getDynamicPropertyIds();

    let propertiesList = "§l§oWorld Properties:\n\n";
    if (worldProperties.length === 0) {
        propertiesList += "§cNo world properties found.";
    } else {
        worldProperties.forEach(property => {
            const value = world.getDynamicProperty(property);
            if (value === undefined) {
                propertiesList += `§f${property}: §cundefined\n`;
            } else {
                propertiesList += `§f${property}: §7${value}\n`;
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
            if (r.selection === 0) modifyWorldProperties(player);
            if (r.selection === 1) clearAllWorldProperties(player);
            if (r.selection === 2) propertiesMenu(player);
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
                worldPropertiesMenu(player);
                return;
            }

            if (keyField.trim() === "" || valueField.trim() === "") {
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cBoth key and value must be provided!"}]}`);
                return;
            }

            world.setDynamicProperty(keyField, valueField);
            player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aWorld property ${keyField} has been set to ${valueField}."}]}`);
        })
        .catch(error => {
            console.error("Error with ModalFormData:", error);
            worldPropertiesMenu(player);
        });
}

function clearAllWorldProperties(player) {
    world.clearDynamicProperties();
    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aAll dynamic properties have been cleared successfully!"}]}`);
    console.log("All dynamic properties cleared by", player.nameTag);
    worldPropertiesMenu(player)
}
console.info('properties_menu.js loaded')