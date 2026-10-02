import { world, system } from "@minecraft/server";
import { getActiveQuest, completeQuest } from "../gui/quest_menu.js";

import { log, LOG_LEVELS } from "../logger.js";
import * as Economy from "../core/economy.js";

export function startMaintainBalanceQuest(player, selectedQuest) {
    if (!player || !selectedQuest) return;

    const currentBalance = Economy.getBalance(player);
    if (currentBalance === undefined || currentBalance < selectedQuest.objective.amount) {
        player.sendMessage(`§cYou don't have enough Moneyz to start this quest. You need at least ${selectedQuest.objective.amount}!`);
        return;
    }

    player.setDynamicProperty(`balanceStartTime_${selectedQuest.property}`, Date.now());
    player.setDynamicProperty("activeQuest", JSON.stringify(selectedQuest));
    player.sendMessage(`§aYou started the '${selectedQuest.description}' quest.`);
}

function failMaintainBalanceQuest(player, quest) {
    player.setDynamicProperty(`balanceStartTime_${quest.property}`, null);
    player.setDynamicProperty("activeQuest", null);
    player.sendMessage(`§cYou failed the '${quest.description}' quest because your balance dropped below the required amount.`);
    try { player.onScreenDisplay.setActionBar("§cQuest Failed! Balance dropped."); } catch {}
}

const lastMessageTimes = new Map();

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const activeQuest = getActiveQuest(player);

        if (activeQuest?.objective?.type === "maintain_balance") {
            const requiredBalance = activeQuest.objective.amount;
            const requiredDuration = activeQuest.objective.duration;
            const startTime = player.getDynamicProperty(`balanceStartTime_${activeQuest.property}`);
            const currentBalance = Economy.getBalance(player);

            if (startTime !== null && startTime !== undefined && currentBalance !== undefined) {
                const elapsedTime = Date.now() - Number(startTime);
                const remainingTime = requiredDuration - elapsedTime;

                if (currentBalance >= requiredBalance) {
                    const lastMsgTime = lastMessageTimes.get(player.nameTag) || 0;
                    if (elapsedTime - lastMsgTime >= 5000) {
                        const minutesRemaining = Math.max(0, Math.floor(remainingTime / 60000));
                        const secondsRemaining = Math.max(0, Math.floor((remainingTime % 60000) / 1000));
                        try {
                            player.onScreenDisplay.setActionBar(`§eMaintain Balance: ${minutesRemaining}m ${secondsRemaining}s rem`);
                        } catch {}
                        lastMessageTimes.set(player.nameTag, elapsedTime);
                    }

                    if (elapsedTime >= requiredDuration) {
                        completeQuest(player, activeQuest);
                        try { player.onScreenDisplay.setActionBar("§aMaintain Balance Quest Completed!"); } catch {}
                        player.setDynamicProperty(`balanceStartTime_${activeQuest.property}`, null);
                        lastMessageTimes.delete(player.nameTag);
                    }
                } else {
                    failMaintainBalanceQuest(player, activeQuest);
                    lastMessageTimes.delete(player.nameTag);
                }
            }
        } else if (!activeQuest) {
            lastMessageTimes.delete(player.nameTag);
        }
    }
}, 20);

log("maintain.js loaded", LOG_LEVELS.DEBUG);
