import { world, system } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { getScore, updateScore } from '../utilities.js';
import { openRewardsMenu } from './rewards_menu.js';
import { moneyzAdmin } from './admin_menu.js';
import { luckyMenu } from './lucky_menu.js';
import { chanceMenu } from './chance_menu.js';
import { customShop } from './custom_shop.js';
import { giveQuest } from './quest_menu.js';
import { log, LOG_LEVELS } from '../logger.js';

export function main(player) {
    
    const form = new ActionFormData();
    form.title("§l§1Moneyz Menu");
    
    form.body(`§l§o§fWelcome §g${player.nameTag}§f!\n§fMoneyz Balance: §g${getScore('Moneyz', player.nameTag)}`);
    
    const buttons = [];
    const actions = [];

    if (player.getDynamicProperty('moneyzShop') === "true") {
        buttons.push('§d§lShops\n§r§7[ Click to Shop ]');
        actions.push(() => shops(player));
    }
    
    if (player.getDynamicProperty('moneyzATM') === "true") {
        buttons.push('§d§lATM\n§r§7[ Click to Exchange ]');
        actions.push(() => player.runCommandAsync("dialogue open @s @s atm"));
    }
    
    if (player.getDynamicProperty('moneyzSend') === "true") {
        buttons.push('§d§lSend Moneyz\n§r§7[ Click to Send Moneyz ]');
        actions.push(() => moneyzTransfer(player));
    }
    
    if (player.getDynamicProperty('moneyzQuest') === "true") {
        buttons.push('§d§lQuest\n§r§7[ Click to View ]');
        actions.push(() => giveQuest(player));
    }

    if (player.getDynamicProperty('moneyzDaily') === "true") {
        buttons.push('§d§lDaily Reward\n§r§7[ Click to Redeem ]');
        actions.push(() => openRewardsMenu(player));
    }

    if (player.getDynamicProperty('moneyzLucky') === "true" || player.getDynamicProperty('moneyzChance') === "true") {
        buttons.push('§d§lFeeling Lucky?\n§r§7[ Click to See ]');
        actions.push(() => luckyMenu(player));
    }
    
    if (player.hasTag('moneyzAdmin')) {
        buttons.push('§d§lMoneyz Admin\n§r§7[ Click to Manage ]');
        actions.push(() => moneyzAdmin(player));
    }
    
    buttons.push('§d§lHelp\n§r§7[ Click for Help ]');
    actions.push(() => player.runCommandAsync("dialogue open @s @s help"));

    buttons.push('§d§lCredits\n§r§7[ Click to View ]');
    actions.push(() => Credits(player));

    buttons.push('§c§lExit Menu');
    actions.push(() => { /* exit action, no specific function needed */ });
    
    buttons.forEach(button => form.button(button));

    form.show(player).then(({ selection }) => {
        if (selection >= 0 && selection < actions.length) {
            actions[selection]();
        }
    });
};

function shops(player) {

    const customShopName = world.getDynamicProperty("customShop") || "Custom Shop";

    new ActionFormData()
        .title("§l§1Shop Menu")
        .body(`§l§o§fMoneyz Balance: §g${getScore('Moneyz', player.nameTag)}`)
        .button("§d§lArmory\n§r§7[ Click to Shop ]")
        .button("§d§lCrafter's Market\n§r§7[ Click to Shop ]")
        .button("§d§lFarmer's Market\n§r§7[ Click to Shop ]")
        .button("§d§lLibrary\n§r§7[ Click to Shop ]")
        .button("§d§lPet Shop\n§r§7[ Click to Shop ]")
        .button("§d§lWorkshop\n§r§7[ Click to Shop ]")
        .button(`§d§l${customShopName}\n§r§7[ Click to Shop ]`)
        .button("§c§lBack")
        .show(player)
        .then(r => {
            if (r.selection === 0) {
                player.runCommandAsync("dialogue open @s @s armory");
            } else if (r.selection === 1) {
                player.runCommandAsync("dialogue open @s @s craftershop");
            } else if (r.selection === 2) {
                player.runCommandAsync("dialogue open @s @s farmers_market");
            } else if (r.selection === 3) {
                player.runCommandAsync("dialogue open @s @s library");
            } else if (r.selection === 4) {
                player.runCommandAsync("dialogue open @s @s petshop");
            } else if (r.selection === 5) {
                player.runCommandAsync("dialogue open @s @s workshop");
            } else if (r.selection === 6) {
                customShop(player);
            } else if (r.selection === 7) {
                main(player);
            }
        })
        .catch(error => {
            log(`Error showing shop menu: ${error.message}`, LOG_LEVELS.ERROR);
            player.sendMessage("§cAn error occurred while opening the shop.");
        });
}

const moneyzTransfer = async (player) => {
  log('Opening Money Transfer Menu for player:', LOG_LEVELS.DEBUG, player.nameTag);

  const players = [...world.getPlayers()];
  new ModalFormData()
    .title("§l§1Send Moneyz")
    .dropdown('§o§fChoose Who to Send Moneyz to!', players.map(p => p.nameTag))
    .textField(`§fEnter the Amount to Send!\n§fMoneyz Balance: §g${await getScore('Moneyz', player.nameTag)}`, `§oNumbers Only`)
    .show(player)
    .then(async (result) => {
      if (!result || !result.formValues) {
        log("Money Transfer Menu closed without input.", LOG_LEVELS.INFO, player.nameTag);
        return;
      }

      const [dropdownIndex, textField] = result.formValues;

      if (dropdownIndex === undefined) {
          log("No player selected", LOG_LEVELS.WARN, player.nameTag);
          return;
      }

      const selectedPlayer = players[dropdownIndex];

      if (selectedPlayer === player) {
          player.runCommandAsync(`playsound note.bassattack @s ~ ~ ~`);
          log(`${player.nameTag} tried sending Moneyz to self`, LOG_LEVELS.WARN);
          player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou Can't Send Moneyz to Yourself"}]}`);
          moneyzTransfer(player);
          return;
      }

      if (textField.includes("-")) {
          player.runCommandAsync(`playsound note.bassattack @s ~ ~ ~`);
          log(`${player.nameTag} entered invalid numbers (negative)`, LOG_LEVELS.WARN);
          player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cNumbers Only!"}]}`);
          moneyzTransfer(player);
          return;
      }

      const amountToSend = parseInt(textField, 10);

      const senderBalance = await getScore('Moneyz', player.nameTag);
      if (isNaN(amountToSend)) {
          player.runCommandAsync(`playsound note.bassattack @s ~ ~ ~`);
          log(`${player.nameTag} entered invalid numbers (NaN)`, LOG_LEVELS.WARN);
          player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlease enter a valid number!"}]}`);
          moneyzTransfer(player);
          return;
      }
      if (!senderBalance || senderBalance < amountToSend) {
        player.runCommandAsync(`playsound note.bassattack @s ~ ~ ~`);
        log(`${player.nameTag} didn't have enough Moneyz to send`, LOG_LEVELS.WARN);
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou Don't Have Enough Moneyz"}]}`);
        moneyzTransfer(player);
        return;
      }

      try {
        await updateScore(player, amountToSend, "remove");

        player.runCommandAsync(`playsound random.levelup @s ~ ~ ~`);
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aSent §l${selectedPlayer.nameTag} §r§2${amountToSend} Moneyz"}]}`);
        selectedPlayer.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§l${player.nameTag} §r§aSent You §2${amountToSend} Moneyz"}]}`);

        await updateScore(selectedPlayer, amountToSend, "add");
        selectedPlayer.runCommandAsync(`playsound random.levelup @s ~ ~ ~`);

        log(`${player.nameTag} sent ${amountToSend} Moneyz to ${selectedPlayer.nameTag}`, LOG_LEVELS.INFO);
      } catch (error) {
        player.runCommandAsync(`playsound note.bassattack @s ~ ~ ~`);
        log(`Error during Moneyz transfer: ${error}`, LOG_LEVELS.ERROR, player.nameTag);
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cAn error occurred during the transfer."}]}`);
      }
    })
    .catch((error) => {
      log(`Error during Money Transfer Menu: ${error}`, LOG_LEVELS.ERROR, error, error.stack);
    });
};

function Credits(player) {
    new ActionFormData()
        .title('§l§1Credits')
        .body(`\n§l§5Creator: §dZVortex11325\n§5Link: §dlinktr.ee/dmedina559\n§5Version: §d1.9.0`)
        .button(`§c§lBack`)
        .show(player).then(r => {
            if (r.selection == 0) main(player)
        })
}

log('moneyz_menu.js loaded', LOG_LEVELS.DEBUG);