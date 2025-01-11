import { world, system } from "@minecraft/server";
import { updateScore, getCurrentUTCDate } from '../utilities.js';
import { getActiveQuest, completeQuest } from "../gui/quest_menu.js";
import { log, LOG_LEVELS } from '../logger.js';

export const MOB_REWARDS = {
    "minecraft:spider": 15,
    "minecraft:zombie": 25,      
    "minecraft:skeleton": 30,   
    "minecraft:creeper": 50,    
    "minecraft:enderman": 100   
};

world.afterEvents.entityDie.subscribe(event => {
    const killedEntity = event.deadEntity;
    const killer = event.damageSource.damagingEntity;

    if (killer && killer.typeId === "minecraft:player") {
        const activeQuest = getActiveQuest(killer);

        if (activeQuest && activeQuest.objective && activeQuest.objective.type === "slay") {
            if (activeQuest.objective.entityTypes.includes(killedEntity.typeId)) {
                if (activeQuest.objective.count > 0) {
                    activeQuest.objective.count -= 1;
                    killer.setDynamicProperty("activeQuest", JSON.stringify(activeQuest));
                    killer.sendMessage(`§eYou still need to kill ${activeQuest.objective.count} hostile mobs.`);

                    if (activeQuest.objective.count <= 0) {
                        completeQuest(killer, activeQuest);
                    }
                    if (MOB_REWARDS[killedEntity.typeId]) {
                        const rewardAmount = MOB_REWARDS[killedEntity.typeId];
                        updateScore(killer, rewardAmount, "add");
                        killer.sendMessage(`§aYou earned ${rewardAmount} Moneyz for killing a ${killedEntity.typeId.replace("minecraft:", "")}!`);
                    }
                } else {
                    log(`Slay Quest already completed, skipping.`, LOG_LEVELS.DEBUG);
                }
            }
        }
    }
}, { entityTypes: Object.keys(MOB_REWARDS) });

log('slay.js loaded', LOG_LEVELS.DEBUG);