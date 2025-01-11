import { world, system } from "@minecraft/server";
import { getActiveQuest, completeQuest } from "../gui/quest_menu.js";
import { getScore } from '../utilities.js';
import { log, LOG_LEVELS } from '../logger.js';

function getCurrentTimeMillis() {
  return Date.now();
}

export function startMaintainBalanceQuest(player, selectedQuest) {
  const quest = selectedQuest
  const currentBalance = getScore('Moneyz', player.nameTag);
  if (currentBalance === undefined || currentBalance < quest.objective.amount) {
    player.sendMessage(`§cYou don't have enough Moneyz to start this quest. You need at least ${quest.objective.amount}!`);
    return;
  }

  player.setDynamicProperty(`balanceStartTime_${quest.property}`, getCurrentTimeMillis());
  player.setDynamicProperty("activeQuest", JSON.stringify(quest));
  player.sendMessage(`§aYou started the '${quest.description}' quest.`);
}

function failMaintainBalanceQuest(player, quest) {
  player.setDynamicProperty(`balanceStartTime_${quest.property}`, null);
  player.setDynamicProperty("activeQuest", null);
  player.sendMessage(`§cYou failed the '${quest.description}' quest because your balance dropped below the required amount.`);
}

const lastMessageTimes = new Map();

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const activeQuest = getActiveQuest(player);

        if (activeQuest && activeQuest.objective.type === "maintain_balance") {
            const requiredBalance = activeQuest.objective.amount;
            const requiredDuration = activeQuest.objective.duration;
            const startTime = player.getDynamicProperty(`balanceStartTime_${activeQuest.property}`);
            const currentBalance = getScore('Moneyz', player.nameTag);

            if (startTime !== null && currentBalance !== undefined) {
                const elapsedTime = getCurrentTimeMillis() - startTime;
                const remainingTime = requiredDuration - elapsedTime;

                if (currentBalance >= requiredBalance) {
                    const lastMessageTime = lastMessageTimes.get(player.nameTag) || 0;
                    if (elapsedTime - lastMessageTime >= 1000 * 60) {
                        const minutesRemaining = Math.floor(remainingTime / (1000 * 60));
                        const secondsRemaining = Math.floor((remainingTime % (1000 * 60)) / 1000);
                        player.sendMessage(`§eYou have ${minutesRemaining} minutes and ${secondsRemaining} seconds remaining in the Maintain Balance quest.`);
                        lastMessageTimes.set(player.nameTag, elapsedTime);
                    }

                    if (elapsedTime >= requiredDuration) {
                        completeQuest(player, activeQuest);
                        player.setDynamicProperty(`balanceStartTime_${activeQuest.property}`, null);
                        lastMessageTimes.delete(player.nameTag);
                    }
                } else {
                    failMaintainBalanceQuest(player, activeQuest);
                    lastMessageTimes.delete(player.nameTag);
                }
            }
        } else if (activeQuest === null){
            lastMessageTimes.delete(player.nameTag);
        }
    }
}, 20);