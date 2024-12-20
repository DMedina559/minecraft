import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { main } from './moneyz_menu.js';
import { log, LOG_LEVELS } from '../logger.js';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
  log(`Generated random integer between ${min} and ${max}: ${result}`, LOG_LEVELS.DEBUG);
}

function getWorldProperty(key) {
  return world.getDynamicProperty(key);
  log(`Retrieved world property "${key}": ${property}`, LOG_LEVELS.DEBUG);
}

export function chanceMenu(player) {
  const worldMultiplier = getWorldProperty("chanceX") || 0;

  const chanceMessage = `§l§oTake a chance!\nYou have a chance to win ${worldMultiplier}x your stake amount!`;

  new ActionFormData()
    .title("§l§6Chance Menu")
    .body(chanceMessage)
    .button("§2§lTest Your Luck")
    .button("§4§lBack")
    .show(player).then(r => {
      if (r.selection === 0) {
        const scoreboard = world.scoreboard;
        if (!scoreboard) {
          log("Scoreboard not found!", LOG_LEVELS.ERROR);
          player.sendMessage("§cAn error occurred. Please try again later.");
          return;
        }

        const objectiveName = "Moneyz";
        const objective = scoreboard.getObjective(objectiveName);
        if (!objective) {
          log(`Objective "${objectiveName}" does not exist.`, LOG_LEVELS.WARN);
          player.sendMessage(`§cThe Moneyz objective is missing. Contact an administrator.`);
          return;
        }

        try {
          const participants = objective.getParticipants();
          const playerIdentity = participants.find(p => p.displayName === player.nameTag);

          if (!playerIdentity) {
            player.sendMessage(`§cYou do not have any Moneyz in the scoreboard "${objectiveName}".`);
            return;
          }

          const playerScore = objective.getScore(playerIdentity);
          if (playerScore === undefined) {
            player.sendMessage(`§cYour score could not be retrieved. Please try again later.`);
            return;
          }

          const modalForm = new ModalFormData()
            .title('Take a Chance')
            .textField('Enter your stake amount:', '0');

          modalForm.show(player).then(response => {
            if (response.canceled) {
              return;
            }

            const stakeAmount = parseInt(response.formValues[0], 10);

            const worldMultiplier = getWorldProperty("chanceX") || 0;

            log(`Player's Score: ${playerScore}, Stake Amount: ${stakeAmount}, World Multiplier: ${worldMultiplier}`, LOG_LEVELS.DEBUG);

            if (isNaN(stakeAmount) || stakeAmount <= 0) {
              player.sendMessage('§cInvalid stake amount. Please enter a positive number.');
              chanceMenu(player);
              player.runCommandAsync("playsound note.bassattack @s ~ ~ ~");
              log(`Player ${player.nameTag} entered an invalid stake amount.`, LOG_LEVELS.WARN);
              return;
            }

            if (stakeAmount > playerScore) {
              player.sendMessage('§cInvalid stake amount. You cannot stake more than your current balance.');
              chanceMenu(player);
              player.runCommandAsync("playsound note.bassattack @s ~ ~ ~");
              log(`Player ${player.nameTag} tried to stake more than their balance.`, LOG_LEVELS.WARN);
              return;
            }

            const winChance = getWorldProperty("chanceWin") || 0;
            if (getRandomInt(1, 100) <= winChance) {
              const winAmount = stakeAmount * worldMultiplier;
              objective.setScore(playerIdentity, playerScore + winAmount);
              player.sendMessage(`§aYou won ${winAmount} Moneyz!`);
              player.runCommandAsync("playsound random.levelup @s ~ ~ ~");
              log(`Player ${player.nameTag} won ${winAmount} Moneyz.`, LOG_LEVELS.INFO);
            } else {
              objective.setScore(playerIdentity, playerScore - stakeAmount);
              player.sendMessage(`§cYou lost ${stakeAmount} Moneyz. Better luck next time!`);
              player.runCommandAsync("playsound note.bassattack @s ~ ~ ~");
              log(`Player ${player.nameTag} lost ${stakeAmount} Moneyz.`, LOG_LEVELS.INFO);
            }

            chanceMenu(player);

          }).catch(error => {
            log(`Error showing modal form: ${error}`, LOG_LEVELS.ERROR);
            player.sendMessage("§cAn error occurred. Please try again later.");
          });

        } catch (error) {
           log(`Error processing chance for ${player.nameTag}: ${error}`, LOG_LEVELS.ERROR);
           player.sendMessage("§cAn error occurred. Please try again later.");
        }
      } else if (r.selection === 1) {
        main(player);
      }
    });
}

log('chance_menu.js loaded', LOG_LEVELS.DEBUG);