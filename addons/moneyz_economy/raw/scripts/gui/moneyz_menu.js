import { world, system } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { getScore, updateScore, getCurrentUTCDate } from '../utilities.js';
import { openRewardsMenu } from './rewards_menu.js';
import { moneyzAdmin } from './admin_menu.js';
import { luckyPurchase } from './lucky_menu.js';
import { chanceMenu } from './chance_menu.js';
import { log, LOG_LEVELS } from '../logger.js';

const title = "§l§1Moneyz Menu";

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
    
    if (player.getDynamicProperty('moneyzDaily') === "true") {
        buttons.push('§d§lDaily Reward\n§r§7[ Click to Redeem ]');
        actions.push(() => openRewardsMenu(player));
    }

    if (player.getDynamicProperty('moneyzLucky') === "true") {
        buttons.push('§d§lFeeling Lucky?\n§r§7[ Click to See ]');
        actions.push(() => luckyPurchase(player));
    }

    if (player.getDynamicProperty('moneyzChance') === "true") {
        buttons.push('§d§lChance Game\n§r§7[ Click to Play ]');
        actions.push(() => chanceMenu(player));
    }
    
    if (player.hasTag('moneyzAdmin')) {
        buttons.push('§d§lMoneyz Admin\n§r§7[ Click to Manage ]');
        actions.push(() => moneyzAdmin(player));
    }
    
    
    buttons.push('§d§lHelp\n§r§7[ Click for Help ]');
    actions.push(() => player.runCommandAsync("dialogue open @s @s help"));

    buttons.push('§d§lCredits\n§r§7[ Click to View ]');
    actions.push(() => Credits(player));

    buttons.push('§4§lExit Menu');
    actions.push(() => { /* exit action, no specific function needed */ });
    
    buttons.forEach(button => form.button(button));

    form.show(player).then(({ selection }) => {
        if (selection >= 0 && selection < actions.length) {
            actions[selection]();
        }
    });
};

function shops(player) {
    new ActionFormData()
        .title(title)
        .body(`§fMoneyz Balance: §g${getScore('Moneyz', player.nameTag)}`)
        .button("§d§lArmory\n§r§7[ Click to Shop ]")
        .button("§d§lCrafters's Market\n§r§7[ Click to Shop ]")
        .button("§d§lFarmer's Market\n§r§7[ Click to Shop ]")
        .button("§d§lLibrary\n§r§7[ Click to Shop ]")
        .button("§d§lPet Shop\n§r§7[ Click to Shop ]")
        .button("§d§lWorkshop\n§r§7[ Click to Shop ]")
        .button(`§4§lBack`)
        .show(player).then(r => {
            if (r.selection == 0) {
                player.runCommandAsync("dialogue open @s @s armory")
            }
            if (r.selection == 1) {
                player.runCommandAsync("dialogue open @s @s craftershop")
            }
            if (r.selection == 2) {
                player.runCommandAsync("dialogue open @s @s farmers_market")
            }
            if (r.selection == 3) {
                player.runCommandAsync("dialogue open @s @s library")
            }
            if (r.selection == 4) {
                player.runCommandAsync("dialogue open @s @s petshop")
            }
            if (r.selection == 5) {
                player.runCommandAsync("dialogue open @s @s workshop")
            }
            if (r.selection == 6) main(player)
        })
};

const moneyzTransfer = (player) => {
  log('Opening Money Transfer Menu for player:', LOG_LEVELS.DEBUG, player.nameTag);

  const players = [...world.getPlayers()];
  new ModalFormData()
    .title(title)
    .dropdown('§o§fChoose Who to Send Moneyz to!', players.map(player => player.nameTag))
    .textField(`§fEnter the Amount to Send!\n§fMoneyz Balance: §g${getScore('Moneyz', player.nameTag)}`, `§oNumbers Only`)
    .show(player)
    .then(({ formValues: [dropdown, textField] }) => {
      const selectedPlayer = players[dropdown];

      if (selectedPlayer === player) {
        log(`${player.nameTag} tried sending Moneyz to self`, LOG_LEVELS.WARN);
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou Can't Send Moneyz to Yourself"}]}`);
        moneyzTransfer(player);
        return;
      }

      if (textField.includes("-")) {
        log(`${player.nameTag} entered invalid numbers (negative)`, LOG_LEVELS.WARN);
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cNumbers Only!"}]}`);
        moneyzTransfer(player);
        return;
      }

      const amountToSend = parseInt(textField, 10);

      const senderBalance = getScore('Moneyz', player);
      if (!senderBalance || senderBalance < amountToSend) {
        log(`${player.nameTag} didn't have enough Moneyz to send`, LOG_LEVELS.WARN);
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou Don't Have Enough Moneyz"}]}`);
        moneyzTransfer(player);
        return;
      }

      try {

        updateScore(player, amountToSend, "remove");

        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§aSent §l${selectedPlayer.nameTag} §r§2${amountToSend} Moneyz"}]}`);
        selectedPlayer.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§l${player.nameTag} §r§aSent You §2${amountToSend} Moneyz"}]}`);

        updateScore(selectedPlayer, amountToSend, "add");

        log(`${player.nameTag} sent ${amountToSend} Moneyz to ${selectedPlayer.nameTag}`, LOG_LEVELS.INFO);
      } catch (error) {
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
        .title(title)
        .body(`§l§o§6Credits\n\n§5Creator: §dZVortex11325\n§5Link: §dlinktr.ee/dmedina559\n§5Version: §d1.9.0`)
        .button(`§4§lBack`)
        .show(player).then(r => {
            if (r.selection == 0) main(player)
        })
}

log('moneyz_menu.js loaded', LOG_LEVELS.DEBUG);