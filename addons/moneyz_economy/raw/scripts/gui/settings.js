import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { moneyzAdmin } from './admin_menu.js';
import { log, LOG_LEVELS, setLogLevelFromWorldProperty } from '../logger.js';

const title = "§l§1Setings";

export function moneyzSettings(player) {
  log(`Player ${player.nameTag} opened the Moneyz Settings Menu.`, LOG_LEVELS.DEBUG);
  const form = new ActionFormData()
    .title(title)
    .body(`§l§o§fMoneyz Settings`)
    .button(`§d§lDaily Reward Amount\n§r§7[ Set Level ]`)
    .button(`§d§lChance Game Settings\n§r§7[ Set Level ]`)
    .button(`§d§lManage Auto Tags\n§r§7[ Click to Manage ]`)
    .button(`§d§lLog Level\n§r§7[ Set Level ]`)
    .button(`§4§lBack`);

  form.show(player).then(r => {
    if (r.selection === 0) dailyRewardSettings(player);
    if (r.selection === 1) chanceSettings(player);
    if (r.selection === 2) toggleAutoTags(player);
    if (r.selection === 3) showLogLevelMenu(player);
    if (r.selection === 4) moneyzAdmin(player);
  });
};

function toggleAutoTags(player) {
    log(`Player ${player.nameTag} opened the Auto Tag Menu.`, LOG_LEVELS.DEBUG);
    const options = ['syncPlayers', 'moneyzShop', 'moneyzATM', 'moneyzSend', 'moneyzDaily', 'moneyzLucky', 'moneyzChance', 'oneLuckyPurchase'];
    const scores = options.map(tag => `${tag}: ${world.getDynamicProperty(tag)}`);

    new ActionFormData()
        .title("Toggle Auto Tags")
        .body(`§l§oToggle Auto Tags:\n${scores.join('\n')}`)
        .button('§d§lToggle syncPlayers')
        .button('§d§lToggle moneyzShop')
        .button('§d§lToggle moneyzATM')
        .button('§d§lToggle moneyzSend')
        .button('§d§lToggle moneyzDaily')
        .button('§d§lToggle moneyzLucky')
        .button('§d§lToggle moneyzChance')
        .button('§d§lToggle oneLuckyPurchase')
        .button('§4§lBack')
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
        .title(`Set ${propertyName}`)
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