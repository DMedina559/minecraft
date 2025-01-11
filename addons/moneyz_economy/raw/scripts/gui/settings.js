import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { moneyzAdmin } from './admin_menu.js';
import { log, LOG_LEVELS, setLogLevelFromWorldProperty } from '../logger.js';

export function moneyzSettings(player) {
    log(`Player ${player.nameTag} opened the Moneyz Settings Menu.`, LOG_LEVELS.DEBUG);

    const form = new ActionFormData();
    form.title('§l§1Settings');

    const buttons = [];
    const actions = [];

    buttons.push('§d§lDaily Reward Amount\n§r§7[ Set Amount ]');
    actions.push(() => dailyRewardSettings(player));

    buttons.push('§d§lChance Game Settings\n§r§7[ Set Chance Settings ]');
    actions.push(() => chanceSettings(player));

    buttons.push('§d§lCustom Shop Name\n§r§7[ Set Shop Name ]');
    actions.push(() => customShopSettings(player));

    if (world.getDynamicProperty('syncPlayers') === "true") {
      buttons.push(`§d§lManage Auto Tags\n§r§7[ Click to Manage ]`);
      actions.push(() => toggleAutoTags(player));
    };

    buttons.push('§d§lPatrol Location\n§r§7[ Click to Set ]');
    actions.push(() => setPatrolLocation(player));

    const syncPlayers = world.getDynamicProperty('syncPlayers') === "true";
    buttons.push(`§d§lSync Players\n§r§7[ ${syncPlayers ? 'Enabled' : 'Disabled'} ]`);
    actions.push(() => {
        world.setDynamicProperty('syncPlayers', syncPlayers ? "false" : "true");
        log(`syncPlayers set to ${!syncPlayers}`, LOG_LEVELS.INFO);
        moneyzSettings(player);
    });

    const oneLuckyPurchase = world.getDynamicProperty('oneLuckyPurchase') === "true";
    buttons.push(`§d§lOne Lucky Purchase\n§r§7[ ${oneLuckyPurchase ? 'Enabled' : 'Disabled'} ]`);
    actions.push(() => {
        world.setDynamicProperty('oneLuckyPurchase', oneLuckyPurchase ? "false" : "true");
        log(`oneLuckyPurchase set to ${!oneLuckyPurchase}`, LOG_LEVELS.INFO);
        moneyzSettings(player);
    });

    const logLevel = world.getDynamicProperty('logLevel');
    buttons.push(`§d§lLog Level\n§r§7[ ${logLevel} ]`);
    actions.push(() => showLogLevelMenu(player));

    buttons.push('§c§lBack');
    actions.push(() => moneyzAdmin(player));

    buttons.forEach(button => form.button(button));

    form.show(player).then(({ selection }) => {
        if (selection >= 0 && selection < actions.length) {
            actions[selection]();
        }
    });
};

function toggleAutoTags(player) {
    log(`Player ${player.nameTag} opened the Auto Tag Menu.`, LOG_LEVELS.DEBUG);
    const options = ['moneyzShop', 'moneyzATM', 'moneyzSend', 'moneyzQuest', 'moneyzDaily', 'moneyzLucky', 'moneyzChance'];
    const scores = options.map(tag => `${tag}: ${world.getDynamicProperty(tag)}`);

    new ActionFormData()
        .title("§l§1Toggle Auto Tags")
        .body(`§l§oToggle Auto Tags:\n${scores.join('\n')}`)
        .button('§d§lToggle moneyzShop')
        .button('§d§lToggle moneyzATM')
        .button('§d§lToggle moneyzSend')
        .button('§d§lToggle moneyzQuest')
        .button('§d§lToggle moneyzDaily')
        .button('§d§lToggle moneyzLucky')
        .button('§d§lToggle moneyzChance')
        .button('§c§lBack')
        .show(player).then(({ selection }) => {
            if (selection >= 0 && selection < options.length) {
                const selectedTag = options[selection];
                const currentValue = world.getDynamicProperty(selectedTag);
                const newValue = currentValue === 'true' ? 'false' : 'true';

                world.setDynamicProperty(selectedTag, newValue);
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aToggled ${selectedTag} to ${newValue === 'true' ? 'On' : 'Off'}."}]}`);
                log(`Player ${player.nameTag} toggled ${selectedTag} to ${newValue === 'true' ? 'On' : 'Off'}.`, LOG_LEVELS.INFO);
                toggleAutoTags(player);
            } else {
                moneyzAdmin(player);
            }
        });
};

function dailyRewardSettings(player) {
  log(`Player ${player.nameTag} opened the Daily Reward Settings Menu.`, LOG_LEVELS.DEBUG);

  const currentReward = world.getDynamicProperty("dailyReward") || 0;

  const form = new ModalFormData()
    .title("§l§1Daily Reward Settings")
    .textField(`Current Daily Reward: ${currentReward}\nEnter the new daily reward value:`, "");

  form.show(player).then(response => {
    if (!response.canceled) {
      const newValue = response.formValues[0];
      const parsedValue = parseInt(newValue);

      if (isNaN(parsedValue) || parsedValue <= 0) {
        log(`Invalid input for daily reward. Received: ${newValue}`, LOG_LEVELS.WARN);
        player.sendMessage("§cInvalid value! Please enter a positive integer.");
        dailyRewardSettings(player);
        return;
      }

      world.setDynamicProperty("dailyReward", parsedValue);
      log(`dailyReward set to: ${parsedValue}`, LOG_LEVELS.INFO);
      player.sendMessage(`§aDaily reward set to: ${parsedValue}`);
      moneyzSettings(player);
    } else {
      
    }
  }).catch(error => {
    log("Error showing daily reward menu:", LOG_LEVELS.ERROR, error);
  });
};

function chanceSettings(player) {
    log(`Player ${player.nameTag} opened the Chance Settings Menu (ActionForm).`, LOG_LEVELS.DEBUG);

    const form = new ActionFormData()
        .title("§l§1Chance Settings")
        .button("Set chanceX")
        .button("Set chanceWin")
        .button("Back");

    form.show(player).then(response => {
        if (!response.canceled) {
            switch (response.selection) {
                case 0:
                    setChanceValue(player, "chanceX");
                    break;
                case 1:
                    setChanceValue(player, "chanceWin");
                    break;
                case 2:
                    system.run(() => moneyzSettings(player));
                    break;
            }
        } else {
            log(`Player ${player.nameTag} canceled Chance Settings Menu.`, LOG_LEVELS.INFO);
            system.run(() => moneyzSettings(player));
        }
    }).catch(error => {
        log("Error showing Chance Settings Menu (ActionForm):", LOG_LEVELS.ERROR, error);
        player.sendMessage("§cAn error occurred. Check Creator logs.");
        system.run(() => moneyzSettings(player));
    });
}

function setChanceValue(player, propertyName) {
    let currentValue = world.getDynamicProperty(propertyName);
    if (currentValue === undefined) {
        currentValue = 0;
        world.setDynamicProperty(propertyName, currentValue);
    }

    const form = new ModalFormData()
        .title(`§l§1Set ${propertyName}`)
        .textField(`Enter new value for ${propertyName}: Current value: ${currentValue}`, "");

    form.show(player).then(response => {
        if (!response.canceled) {
            const newValue = response.formValues?.[0]?.trim();

            if (!newValue) {
                player.sendMessage("§cPlease enter a value.");
                system.run(() => setChanceValue(player, propertyName));
                return;
            }

            const parsedValue = parseFloat(newValue);

            if (isNaN(parsedValue) || parsedValue <= 0 || !Number.isFinite(parsedValue) || (propertyName === "chanceWin" && (parsedValue < 1 || parsedValue > 100))) {
                player.sendMessage(propertyName === "chanceWin" ? "§cInvalid value! Must be between 1 and 100." : "§cInvalid value! Please enter a positive number.");
                system.run(() => setChanceValue(player, propertyName));
                return;
            }

            world.setDynamicProperty(propertyName, parsedValue);
            log(`${propertyName} set to: ${parsedValue}`, LOG_LEVELS.INFO);
            player.sendMessage(`§a${propertyName} set to: ${parsedValue}`);
            system.run(() => moneyzSettings(player));
        } else {
            system.run(() => moneyzSettings(player));
        }
    }).catch(error => {
        log(`Error setting ${propertyName}:`, LOG_LEVELS.ERROR, error);
        player.sendMessage("§cAn error occurred. Check Creator logs.");
        system.run(() => moneyzSettings(player));
    });
};

function customShopSettings(player) {
    log(`Player ${player.nameTag} opened the Custom Shop Name Menu.`, LOG_LEVELS.DEBUG);

    const currentShopName = world.getDynamicProperty("customShop") || "Custom Shop";

    const form = new ModalFormData()
        .title("§l§1Custom Shop Name")
        .textField(`Current Custom Shop Name: ${currentShopName}\nEnter a new Custom Shop Name:`, currentShopName);

    form.show(player).then(response => {
        if (!response.canceled) {
            const newValue = response.formValues[0]?.trim();

            if (!newValue || newValue.length === 0) {
                log(`Invalid input for custom shop name. Received: ${newValue}`, LOG_LEVELS.WARN);
                player.sendMessage("§cInvalid value! Please enter a valid shop name.");
                customShopSettings(player);
                return;
            }

            world.setDynamicProperty("customShop", newValue);
            log(`Custom shop name set to: ${newValue}`, LOG_LEVELS.INFO);
            player.sendMessage(`§aCustom Shop name has been set to: ${newValue}`);
        } else {
            log(`Player ${player.nameTag} canceled the Custom Shop Name Menu.`, LOG_LEVELS.DEBUG);
        }
    }).catch(error => {
        log("Error showing customShopSettings menu:", LOG_LEVELS.ERROR, error);
        player.sendMessage("§cAn error occurred while setting the custom shop name.");
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
        .then(({ formValues }) => {
            if (!formValues || formValues.some(val => val === undefined)) {
                log(`${player.nameTag} canceled patrol location setup.`, LOG_LEVELS.DEBUG);
                moneyzSettings(player);
                return;
            }

            const [xStr, yStr, zStr, radiusStr, timeStr] = formValues;

            const x = parseInt(xStr);
            const y = parseInt(yStr);
            const z = parseInt(zStr);
            const radius = parseInt(radiusStr);
            const time = parseInt(timeStr);

            if (isNaN(x) || isNaN(y) || isNaN(z) || isNaN(radius) || isNaN(time)) {
                player.sendMessage("§cInvalid input. Please enter numbers for all fields.");
                setPatrolLocation(player);
                return;
            }

            if (radius <= 0) {
                player.sendMessage("§cRadius must be greater than 0.");
                setPatrolLocation(player);
                return;
            }

            if (time <= 0) {
                player.sendMessage("§cTime must be greater than 0.");
                setPatrolLocation(player);
                return;
            }

            const patrolLocationString = `${x},${y},${z},${radius},${time}`;
            world.setDynamicProperty("patrolLocation", patrolLocationString);
            player.sendMessage(`§aPatrol location set to: ${patrolLocationString}`);
            log(`Patrol location set to ${patrolLocationString} by ${player.nameTag}`, LOG_LEVELS.INFO);
            moneyzSettings(player);
        })
        .catch(error => {
            log(`Error in setPatrolLocation: ${error}`, LOG_LEVELS.ERROR, player.nameTag, error, error.stack);
            moneyzSettings(player);
        });
}

function showLogLevelMenu(player) {
    log(`Player ${player.nameTag} opened the Log Settings Menu.`, LOG_LEVELS.DEBUG);
    const logLevelOptions = Object.keys(LOG_LEVELS);
    const currentLogLevel = world.getDynamicProperty("logLevel") || "WARN";

    const highlightedOptions = logLevelOptions.map((level, index) => {
        const levelValue = LOG_LEVELS[level];
        const currentLevelValue = LOG_LEVELS[currentLogLevel];
        let prefix = "";

        if (levelValue > currentLevelValue) {
            prefix = "§8";
        } else if (level === currentLogLevel) {
            prefix = "§a ";
        }

        return `${prefix}${level}`;
    });

    const actionForm = new ActionFormData()
        .title("§l§1Set Log Level")
        .body("§l§o§fSelect verbosity of logs:\nDefault: WARN")
        .button(highlightedOptions[0])
        .button(highlightedOptions[1])
        .button(highlightedOptions[2])
        .button(highlightedOptions[3]);

    actionForm.show(player).then(response => {
        if (!response.canceled) {
            const selectedLevel = logLevelOptions[response.selection];
            world.setDynamicProperty("logLevel", selectedLevel);
            setLogLevelFromWorldProperty()
            moneyzSettings(player)
            log(`Log level set to: ${selectedLevel}`, LOG_LEVELS.INFO);
            if (selectedLevel === "DEBUG") {
                player.sendMessage("§cWARNING! Setting log level to DEBUG can impact server performance. Ensure you set the `syncPlayers` world property to `false` to optimize for debugging.");
              }
        } else {
            log("Log level menu canceled by user.", LOG_LEVELS.INFO);
        }
    }).catch(error => {
        log("Error showing action form:", LOG_LEVELS.ERROR, error);
    });
};

log('settings.js loaded', LOG_LEVELS.DEBUG);