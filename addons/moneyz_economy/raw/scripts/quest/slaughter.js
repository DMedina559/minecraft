import { world, system } from "@minecraft/server";
import { updateScore, getCurrentUTCDate } from '../utilities.js';
import { getActiveQuest, completeQuest } from "../gui/quest_menu.js";
import { log, LOG_LEVELS } from '../logger.js';

export const FARM_ANIMALS = {
    "minecraft:cow": 15,
    "minecraft:sheep": 10,
    "minecraft:pig": 10,
    "minecraft:chicken": 5,
    "minecraft:rabbit": 5
};

world.afterEvents.entityDie.subscribe(event => {
    const killedEntity = event.deadEntity;
    const killer = event.damageSource.damagingEntity;

    if (killer && killer.typeId === "minecraft:player") {
        const activeQuest = getActiveQuest(killer);

        if (activeQuest && activeQuest.objective && activeQuest.objective.type === "slaughter") {
            if (Object.keys(FARM_ANIMALS).includes(killedEntity.typeId)) {
                const rewardAmount = FARM_ANIMALS[killedEntity.typeId];
                if (rewardAmount === undefined) {
                    return;
                }

                if (activeQuest.objective.count > 0) {
                    activeQuest.objective.count -= 1;
                    killer.setDynamicProperty("activeQuest", JSON.stringify(activeQuest));
                    killer.sendMessage(`§eYou still need to slaughter ${activeQuest.objective.count} more farm animals.`);

                    if (activeQuest.objective.count <= 0) {
                        completeQuest(killer, activeQuest);
                    }
                    updateScore(killer, rewardAmount, "add");
                    killer.sendMessage(`§aYou earned ${rewardAmount} Moneyz for slaughtering a ${killedEntity.typeId.replace("minecraft:", "")}!`);
                } else {
                    log(`Slaughter Quest already completed, skipping.`, LOG_LEVELS.DEBUG);
                }
            }
        }
    }
}, { entityTypes: Object.keys(FARM_ANIMALS) });

log('slaughter.js loaded', LOG_LEVELS.DEBUG);