import { world } from "@minecraft/server";
import { updateScore } from "../utilities.js";
import { getActiveQuest, completeQuest } from "../gui/quest_menu.js";
import { log, LOG_LEVELS } from "../logger.js";

export const MOB_REWARDS = {
    "minecraft:spider": 15,
    "minecraft:zombie": 25,
    "minecraft:skeleton": 30,
    "minecraft:creeper": 50,
    "minecraft:enderman": 100
};

world.afterEvents.entityDie.subscribe(event => {
    const killedEntity = event.deadEntity;
    const killer = event.damageSource?.damagingEntity;

    if (killer?.typeId === "minecraft:player") {
        const activeQuest = getActiveQuest(killer);

        if (activeQuest?.objective?.type === "slay") {
            if (activeQuest.objective.entityTypes.includes(killedEntity.typeId)) {
                if (activeQuest.objective.count > 0) {
                    activeQuest.objective.count -= 1;
                    killer.setDynamicProperty("activeQuest", JSON.stringify(activeQuest));

                    const mobName = killedEntity.typeId.replace("minecraft:", "").replace(/_/g, " ");

                    if (activeQuest.objective.count <= 0) {
                        completeQuest(killer, activeQuest);
                        try { killer.onScreenDisplay.setActionBar("§aQuest Completed! 🎉"); } catch {}
                    } else {
                        try { killer.onScreenDisplay.setActionBar(`§eQuest Progress: ${activeQuest.objective.count} more hostile mobs to slay`); } catch {}
                    }

                    if (MOB_REWARDS[killedEntity.typeId]) {
                        const rewardAmount = MOB_REWARDS[killedEntity.typeId];
                        updateScore(killer, rewardAmount, "add");
                    }
                }
            }
        }
    }
}, { entityTypes: Object.keys(MOB_REWARDS) });

log("slay.js loaded", LOG_LEVELS.DEBUG);
