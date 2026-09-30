import { world, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { updateScore, getCurrentUTCDate } from "../utilities.js";
import { main } from "./moneyz_menu.js";
import { QUEST_DATA } from "../questData.js";
import { startMaintainBalanceQuest } from "../quest/maintain.js";
import { log, LOG_LEVELS } from "../logger.js";
import "../quest/patrol.js";

function getAvailableQuestsForPlayer(player) {
    const playerTags = player.getTags();
    return QUEST_DATA.filter(quest => quest.tags === undefined || quest.tags.some(tag => playerTags.includes(tag)));
}

export function giveQuest(player, isNpcInteraction) {
    if (!player) return;

    const activeQuestString = player.getDynamicProperty("activeQuest");
    let activeQuest;

    if (activeQuestString && activeQuestString !== "undefined" && activeQuestString !== "null") {
        try {
            activeQuest = JSON.parse(activeQuestString);
        } catch (error) {
            log(`Failed to parse active quest: ${error}`, LOG_LEVELS.ERROR);
            player.sendMessage("§cThere was an error retrieving your current quest. Please try again.");
            return;
        }
    }

    const availableQuests = getAvailableQuestsForPlayer(player) || [];
    const randomQuests = getRandomQuests(availableQuests, 3);
    const form = new ActionFormData().title("§l§1Quest Menu");

    if (activeQuest) {
        form.body(`§l§o§fYou are currently on a quest:\n\n§a${activeQuest.description}\n\n§l§o§fWhat would you like to do?`);
        form.button("§d§lQuit Current Quest");
    } else if (randomQuests.length > 0) {
        const questDescriptions = randomQuests.map((quest, index) => `§7${index + 1}. ${quest.description}`).join("\n");
        form.body(`§l§o§fAvailable Quests:\n\n${questDescriptions}`);
        randomQuests.forEach(quest => form.button(`§d§l${quest.description}`));
    } else {
        form.body("§l§o§fNo quests available. Check back later or interact with NPCs to unlock quests.");
    }

    form.button("§c§lBack");

    form.show(player).then(response => {
        if (!response || response.canceled || response.selection === undefined) return;

        if (activeQuest && response.selection === 0) {
            showQuitConfirmation(player, activeQuest, isNpcInteraction);
            return;
        }

        const backIndex = activeQuest ? 1 : randomQuests.length;
        if (response.selection === backIndex) {
            if (!isNpcInteraction) main(player);
            return;
        }

        const selectedQuestIndex = activeQuest ? response.selection - 1 : response.selection;
        const selectedQuest = randomQuests[selectedQuestIndex];
        if (!selectedQuest) return;

        const currentDate = getCurrentUTCDate();
        const lastCompletionDate = player.getDynamicProperty(`last${selectedQuest.property}`);

        if (lastCompletionDate === currentDate) {
            player.sendMessage(`§cYou can only complete the "${selectedQuest.description}" quest once per day.`);
            return;
        }

        if (selectedQuest.objective?.type === "location") {
            const patrolLocationData = world.getDynamicProperty("patrolLocation");
            if (!patrolLocationData) {
                player.sendMessage("§cPatrol location data is missing. This quest cannot be started.");
                return;
            }
        }

        if (selectedQuest.objective?.type === "maintain_balance") {
            startMaintainBalanceQuest(player, selectedQuest);
        }

        player.setDynamicProperty("activeQuest", JSON.stringify(selectedQuest));
        player.sendMessage(`§aYou have accepted the quest: ${selectedQuest.description}`);
    }).catch(error => {
        log(`Error in giveQuest: ${error}`, LOG_LEVELS.ERROR);
    });
}

function showQuitConfirmation(player, activeQuest, isNpcInteraction) {
    new ActionFormData()
        .title("§l§1Quit Quest?")
        .body(`§l§o§fAre you sure you want to quit the quest:\n\n§a${activeQuest.description}?`)
        .button("§aYES")
        .button("§c§lNo")
        .show(player)
        .then(response => {
            if (!response || response.canceled || response.selection === undefined) return;

            if (response.selection === 0) {
                if (activeQuest.objective?.type === "maintain_balance") {
                    player.setDynamicProperty(`balanceStartTime_${activeQuest.property}`, null);
                }
                player.setDynamicProperty("activeQuest", null);
                player.sendMessage("§aYou have quit your current quest.");
            } else {
                giveQuest(player, isNpcInteraction);
            }
        });
}

const WORLD_SEED_PROPERTY = "dailyQuestSeed";
const WORLD_SEED_DATE_PROPERTY = "lastQuestSeedDate";

function getDailySeed() {
    let seed = world.getDynamicProperty(WORLD_SEED_PROPERTY);
    let seedDate = world.getDynamicProperty(WORLD_SEED_DATE_PROPERTY);
    const currentDate = getCurrentUTCDate();

    if (seed === undefined || seedDate === undefined || seedDate !== currentDate) {
        seed = Math.random().toString(36).substring(2, 15);
        world.setDynamicProperty(WORLD_SEED_PROPERTY, seed);
        world.setDynamicProperty(WORLD_SEED_DATE_PROPERTY, currentDate);
    }
    return seed;
}

function getRandomQuests(quests, count) {
    const seed = getDailySeed();

    function seededRandom(input) {
        let hash = 0;
        const combined = seed + input;
        for (let i = 0; i < combined.length; i++) {
            hash = (hash << 5) - hash + combined.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash % 233280) / 233280;
    }

    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }

    const shuffledQuests = [...quests].sort((a, b) => {
        const hashA = seededRandom(hashCode(a.property));
        const hashB = seededRandom(hashCode(b.property));
        return hashA - hashB;
    });

    const questsByType = {};
    shuffledQuests.forEach(quest => {
        if (!questsByType[quest.objective.type]) {
            questsByType[quest.objective.type] = [];
        }
        questsByType[quest.objective.type].push(quest);
    });

    const selectedQuests = [];
    Object.keys(questsByType).forEach(type => {
        const typeQuests = questsByType[type];
        let bestQuest = null;
        let bestRandom = -1;

        typeQuests.forEach(quest => {
            const random = seededRandom(hashCode(quest.property));
            if (random > bestRandom) {
                bestRandom = random;
                bestQuest = quest;
            }
        });
        if (bestQuest) selectedQuests.push(bestQuest);
    });

    return selectedQuests.slice(0, count);
}

export function getActiveQuest(player) {
    const activeQuestString = player.getDynamicProperty("activeQuest");
    if (!activeQuestString) return null;

    try {
        const activeQuest = JSON.parse(activeQuestString);
        if (!activeQuest || !activeQuest.objective || !activeQuest.property) {
            player.setDynamicProperty("activeQuest", null);
            return null;
        }
        return activeQuest;
    } catch {
        player.setDynamicProperty("activeQuest", null);
        return null;
    }
}

export function completeQuest(player, activeQuest) {
    if (activeQuest && activeQuest.reward) {
        const reward = activeQuest.reward;

        try { player.playSound("random.levelup"); } catch {}

        if (reward.type === "Moneyz") {
            updateScore(player, reward.amount, "add");
            player.sendMessage(`§aYou completed the quest and earned ${reward.amount} Moneyz!`);
        } else if (reward.type === "item") {
            try {
                const item = new ItemStack(reward.itemStack.typeId, reward.itemStack.amount);
                const container = player.getComponent("inventory")?.container;
                if (container) {
                    container.addItem(item);
                } else {
                    player.runCommandAsync(`give @s ${reward.itemStack.typeId} ${reward.itemStack.amount}`);
                }
            } catch {
                player.runCommandAsync(`give @s ${reward.itemStack.typeId} ${reward.itemStack.amount}`);
            }
            player.sendMessage(`§aYou completed the quest and earned ${reward.itemStack.amount} ${reward.itemStack.typeId.replace("minecraft:", "")}!`);
        } else if (reward.type === "experience") {
            try {
                player.addExperience(reward.amount);
            } catch {
                player.runCommandAsync(`xp ${reward.amount} @s`);
            }
            player.sendMessage(`§aYou completed the quest and earned ${reward.amount} Experience!`);
        }

        const currentDate = getCurrentUTCDate();
        player.setDynamicProperty(`last${activeQuest.property}`, currentDate);
        player.setDynamicProperty("activeQuest", null);
    }
}

log("quest_menu.js loaded", LOG_LEVELS.DEBUG);
