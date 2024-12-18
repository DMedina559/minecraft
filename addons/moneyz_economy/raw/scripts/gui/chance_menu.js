import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { main } from './moneyz_menu.js';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getWorldProperty(key) {
  return world.getDynamicProperty(key);
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
          console.error("Scoreboard not found!");
          return;
        }

        const objectiveName = "Moneyz";
        const objective = scoreboard.getObjective(objectiveName);
        if (!objective) {
          console.warn(`Objective "${objectiveName}" does not exist.`);
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

            // Debugging
            console.log(`Player's Score: ${playerScore}`);
            console.log(`Stake Amount: ${stakeAmount}`);

            const worldMultiplier = getWorldProperty("chanceX") || 0;

            console.log(`World Multiplier: ${worldMultiplier}`);

            if (isNaN(stakeAmount) || stakeAmount <= 0) {
              player.sendMessage('§cInvalid stake amount. Please enter a positive number.');
              chanceMenu(player);
              return;
            }

            if (stakeAmount > playerScore) {
              player.sendMessage('§cInvalid stake amount. You cannot stake more than your current balance.');
              chanceMenu(player);
              return;
            }

            const winChance = getWorldProperty("chanceWin") || 0;
            if (getRandomInt(1, 100) <= winChance) {
              const winAmount = stakeAmount * worldMultiplier;
              objective.setScore(playerIdentity, playerScore + winAmount);
              player.sendMessage(`§aYou won ${winAmount} Moneyz!`);
            } else {
              objective.setScore(playerIdentity, playerScore - stakeAmount);
              player.sendMessage(`§cYou lost ${stakeAmount} Moneyz. Better luck next time!`);
            }

            chanceMenu(player);

          }).catch(error => {
            console.error(`Error showing modal form:`, error);
          });

        } catch (error) {
          console.error(`Error processing "${player.nameTag}":`, error);
        }
      } else if (r.selection === 1) {
        main(player);
      }
    });
}
console.info('chance_menu.js loaded');