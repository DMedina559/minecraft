import { world } from "@minecraft/server";
import { updateScore } from "../utilities.js";
import { getActiveQuest, completeQuest } from "../gui/quest_menu.js";
import { log, LOG_LEVELS } from "../logger.js";

export const ORE_BREAK_REWARDS = {
    "minecraft:coal_ore": 5,
    "minecraft:deepslate_coal_ore": 5,
    "minecraft:copper_ore": 8,
    "minecraft:deepslate_copper_ore": 8,
    "minecraft:iron_ore": 10,
    "minecraft:deepslate_iron_ore": 10,
    "minecraft:gold_ore": 20,
    "minecraft:deepslate_gold_ore": 20,
    "minecraft:diamond_ore": 50,
    "minecraft:deepslate_diamond_ore": 50,
    "minecraft:emerald_ore": 75,
    "minecraft:deepslate_emerald_ore": 75,
    "minecraft:lapis_ore": 15,
    "minecraft:deepslate_lapis_ore": 15,
    "minecraft:redstone_ore": 12,
    "minecraft:deepslate_redstone_ore": 12,
    "minecraft:nether_gold_ore": 10,
    "minecraft:quartz_ore": 10
};

world.beforeEvents.playerBreakBlock.subscribe(event => {
    const player = event.player;
    const brokenBlock = event.block;

    if (!player || !brokenBlock) return;

    const activeQuest = getActiveQuest(player);

    if (activeQuest?.objective?.type === "break") {
        const blockTypes = activeQuest.objective.blockTypes;

        if (Array.isArray(blockTypes) && blockTypes.includes(brokenBlock.typeId)) {
            activeQuest.objective.count -= 1;

            const blockName = brokenBlock.typeId.replace("minecraft:", "").replace(/_/g, " ");

            if (activeQuest.objective.count <= 0) {
                completeQuest(player, activeQuest);
                try { player.onScreenDisplay.setActionBar("§aQuest Completed!"); } catch {}
            } else {
                player.setDynamicProperty("activeQuest", JSON.stringify(activeQuest));
                const progressMsg = `§eQuest Progress: ${activeQuest.objective.count} more ${blockName} to mine`;
                try { player.onScreenDisplay.setActionBar(progressMsg); } catch {}
            }

            if (ORE_BREAK_REWARDS[brokenBlock.typeId]) {
                const rewardAmount = ORE_BREAK_REWARDS[brokenBlock.typeId];
                updateScore(player, rewardAmount, "add");
            }

            event.cancel = true;
            try {
                brokenBlock.setType("minecraft:air");
            } catch (err) {
                log(`Failed setting block air: ${err}`, LOG_LEVELS.WARN);
            }
        }
    }
}, {
    blockTypes: Object.keys(ORE_BREAK_REWARDS)
});

log("mine.js loaded", LOG_LEVELS.DEBUG);
