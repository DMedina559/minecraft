import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { moneyzAdmin } from "./admin_menu.js";
import { log, LOG_LEVELS, setLogLevelFromWorldProperty } from "../logger.js";

export function moneyzSettings(player) {
    if (!player) return;

    const form = new ActionFormData();
    form.title("§l§1Settings");

    const buttons = [];
    const actions = [];

    buttons.push("§d§lDaily Reward Amount\n§r§7[ Set Amount ]");
    actions.push(() => dailyRewardSettings(player));

    buttons.push("§d§lChance Game Settings\n§r§7[ Set Chance Settings ]");
    actions.push(() => chanceSettings(player));

    buttons.push("§d§lCustom Shop Name\n§r§7[ Set Shop Name ]");
    actions.push(() => customShopSettings(player));

    if (world.getDynamicProperty("syncPlayers") === "true") {
        buttons.push("§d§lManage Auto Tags\n§r§7[ Click to Manage ]");
        actions.push(() => toggleAutoTags(player));
    }

    buttons.push("§d§lPatrol Location\n§r§7[ Click to Set ]");
    actions.push(() => setPatrolLocation(player));

    const syncPlayers = world.getDynamicProperty("syncPlayers") === "true";
    buttons.push(`§d§lSync Players\n§r§7[ ${syncPlayers ? "Enabled" : "Disabled"} ]`);
    actions.push(() => {
        world.setDynamicProperty("syncPlayers", syncPlayers ? "false" : "true");
        moneyzSettings(player);
    });

    const oneLuckyPurchase = world.getDynamicProperty("oneLuckyPurchase") === "true";
    buttons.push(`§d§lOne Lucky Purchase\n§r§7[ ${oneLuckyPurchase ? "Enabled" : "Disabled"} ]`);
    actions.push(() => {
        world.setDynamicProperty("oneLuckyPurchase", oneLuckyPurchase ? "false" : "true");
        moneyzSettings(player);
    });

    const logLevel = world.getDynamicProperty("logLevel") || "WARN";
    buttons.push(`§d§lLog Level\n§r§7[ ${logLevel} ]`);
    actions.push(() => showLogLevelMenu(player));

    buttons.push("§c§lBack");
    actions.push(() => moneyzAdmin(player));

    buttons.forEach(btn => form.button(btn));

    form.show(player).then(({ selection }) => {
        if (selection !== undefined && selection >= 0 && selection < actions.length) {
            actions[selection]();
        }
    });
}

function toggleAutoTags(player) {
    const options = ["moneyzShop", "moneyzATM", "moneyzSend", "moneyzQuest", "moneyzDaily", "moneyzLucky", "moneyzChance"];
    const scores = options.map(tag => `${tag}: ${world.getDynamicProperty(tag)}`);

    new ActionFormData()
        .title("§l§1Toggle Auto Tags")
        .body(`§l§oToggle Auto Tags:\n${scores.join("\n")}`)
        .button("§d§lToggle moneyzShop")
        .button("§d§lToggle moneyzATM")
        .button("§d§lToggle moneyzSend")
        .button("§d§lToggle moneyzQuest")
        .button("§d§lToggle moneyzDaily")
        .button("§d§lToggle moneyzLucky")
        .button("§d§lToggle moneyzChance")
        .button("§c§lBack")
        .show(player).then(({ selection }) => {
            if (selection !== undefined && selection >= 0 && selection < options.length) {
                const selectedTag = options[selection];
                const currentValue = world.getDynamicProperty(selectedTag);
                const newValue = currentValue === "true" ? "false" : "true";

                world.setDynamicProperty(selectedTag, newValue);
                player.sendMessage(`§aToggled ${selectedTag} to ${newValue === "true" ? "On" : "Off"}.`);
                toggleAutoTags(player);
            } else {
                moneyzAdmin(player);
            }
        });
}

function dailyRewardSettings(player) {
    const currentReward = world.getDynamicProperty("dailyReward") || 0;

    new ModalFormData()
        .title("§l§1Daily Reward Settings")
        .textField(`Current Daily Reward: ${currentReward}\nEnter the new daily reward value:`, "")
        .show(player)
        .then(response => {
            if (response.canceled) return;
            const parsedValue = parseInt(response.formValues[0], 10);

            if (isNaN(parsedValue) || parsedValue <= 0) {
                player.sendMessage("§cInvalid value! Please enter a positive integer.");
                dailyRewardSettings(player);
                return;
            }

            world.setDynamicProperty("dailyReward", parsedValue);
            player.sendMessage(`§aDaily reward set to: ${parsedValue}`);
            moneyzSettings(player);
        });
}

function chanceSettings(player) {
    new ActionFormData()
        .title("§l§1Chance Settings")
        .button("Set chanceX")
        .button("Set chanceWin")
        .button("Back")
        .show(player)
        .then(response => {
            if (response.canceled) {
                system.run(() => moneyzSettings(player));
                return;
            }
            switch (response.selection) {
                case 0: setChanceValue(player, "chanceX"); break;
                case 1: setChanceValue(player, "chanceWin"); break;
                case 2: system.run(() => moneyzSettings(player)); break;
            }
        });
}

function setChanceValue(player, propertyName) {
    let currentValue = world.getDynamicProperty(propertyName);
    if (currentValue === undefined) {
        currentValue = 0;
        world.setDynamicProperty(propertyName, currentValue);
    }

    new ModalFormData()
        .title(`§l§1Set ${propertyName}`)
        .textField(`Enter new value for ${propertyName}: Current value: ${currentValue}`, "")
        .show(player)
        .then(response => {
            if (response.canceled) {
                system.run(() => moneyzSettings(player));
                return;
            }

            const newValue = response.formValues?.[0]?.trim();
            const parsedValue = parseFloat(newValue);

            if (!newValue || isNaN(parsedValue) || parsedValue <= 0 || (propertyName === "chanceWin" && (parsedValue < 1 || parsedValue > 100))) {
                player.sendMessage(propertyName === "chanceWin" ? "§cInvalid value! Must be between 1 and 100." : "§cInvalid value! Please enter a positive number.");
                system.run(() => setChanceValue(player, propertyName));
                return;
            }

            world.setDynamicProperty(propertyName, parsedValue);
            player.sendMessage(`§a${propertyName} set to: ${parsedValue}`);
            system.run(() => moneyzSettings(player));
        });
}

function customShopSettings(player) {
    const currentShopName = world.getDynamicProperty("customShop") || "Custom Shop";

    new ModalFormData()
        .title("§l§1Custom Shop Name")
        .textField(`Current Custom Shop Name: ${currentShopName}\nEnter a new Custom Shop Name:`, currentShopName)
        .show(player)
        .then(response => {
            if (response.canceled) return;
            const newValue = response.formValues[0]?.trim();

            if (!newValue) {
                player.sendMessage("§cInvalid value! Please enter a valid shop name.");
                customShopSettings(player);
                return;
            }

            world.setDynamicProperty("customShop", newValue);
            player.sendMessage(`§aCustom Shop name has been set to: ${newValue}`);
        });
}

function setPatrolLocation(player) {
    new ModalFormData()
        .title("§l§1Set Patrol Location")
        .textField("§fX Coordinate:", "§oEnter X coordinate")
        .textField("§fY Coordinate:", "§oEnter Y coordinate")
        .textField("§fZ Coordinate:", "§oEnter Z coordinate")
        .textField("§fRadius:", "§oEnter radius (blocks)")
        .textField("§fTime (Minutes):", "§oEnter patrol time (minutes)")
        .show(player)
        .then(({ formValues, canceled }) => {
            if (canceled || !formValues) {
                moneyzSettings(player);
                return;
            }

            const [xStr, yStr, zStr, radiusStr, timeStr] = formValues;
            const x = parseInt(xStr, 10);
            const y = parseInt(yStr, 10);
            const z = parseInt(zStr, 10);
            const radius = parseInt(radiusStr, 10);
            const time = parseInt(timeStr, 10);

            if ([x, y, z, radius, time].some(val => isNaN(val)) || radius <= 0 || time <= 0) {
                player.sendMessage("§cInvalid input. Please enter valid numbers.");
                setPatrolLocation(player);
                return;
            }

            const patrolLocationString = `${x},${y},${z},${radius},${time}`;
            world.setDynamicProperty("patrolLocation", patrolLocationString);
            player.sendMessage(`§aPatrol location set to: ${patrolLocationString}`);
            moneyzSettings(player);
        });
}

function showLogLevelMenu(player) {
    const logLevelOptions = Object.keys(LOG_LEVELS);
    const currentLogLevel = world.getDynamicProperty("logLevel") || "WARN";

    const actionForm = new ActionFormData()
        .title("§l§1Set Log Level")
        .body("§l§o§fSelect verbosity of logs:\nDefault: WARN");

    logLevelOptions.forEach(level => actionForm.button(level === currentLogLevel ? `§a ${level}` : level));

    actionForm.show(player).then(response => {
        if (!response.canceled) {
            const selectedLevel = logLevelOptions[response.selection];
            world.setDynamicProperty("logLevel", selectedLevel);
            setLogLevelFromWorldProperty();
            moneyzSettings(player);
        }
    });
}

log("settings.js loaded", LOG_LEVELS.DEBUG);
