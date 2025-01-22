import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { updateScore, getCurrentUTCDate } from '../utilities.js';
import { main } from '../gui/moneyz_menu.js';
import { QUEST_DATA } from '../questData.js';
import { startMaintainBalanceQuest } from '../quest/maintain.js';
import { log, LOG_LEVELS } from '../logger.js';
import "../quest/patrol.js";

//world.beforeEvents.itemUse.subscribe(data => {
//    const player = data.source
//    if (data.itemStack.typeId == "minecraft:diamond") {
//        log(`Player ${player.nameTag} used Diamond item.`, LOG_LEVELS.DEBUG);
//        system.run(() => giveQuest(player))
//    }
//});

function getAvailableQuestsForPlayer(player) {
    const playerTags = player.getTags();
    return QUEST_DATA.filter(quest => quest.tags === undefined || quest.tags.some(tag => playerTags.includes(tag)));
}

export function giveQuest(player, isNpcInteraction) {
  const activeQuestString = player.getDynamicProperty("activeQuest");
  let activeQuest;

  if (activeQuestString && activeQuestString !== "undefined" && activeQuestString !== "null") {
    try {
      activeQuest = JSON.parse(activeQuestString);
    } catch (error) {
      log(`Failed to parse active quest: ${error.message}`, LOG_LEVELS.ERROR, {
        player: player.nameTag,
        error: error.stack,
      });
      player.sendMessage("§cThere was an error retrieving your current quest. Please try again.");
      return;
    }
  }

  const availableQuests = getAvailableQuestsForPlayer(player) || [];
  const randomQuests = getRandomQuests(availableQuests, 3);
  const form = new ActionFormData().title("§l§1Quest Menu");

  if (activeQuest) {
    form.body(
      `§l§o§fYou are currently on a quest:\n\n§a${activeQuest.description}\n\n§l§o§fWhat would you like to do?`
    );
    form.button("§d§lQuit Current Quest");
  } else if (randomQuests.length > 0) {
    const questDescriptions = randomQuests
      .map((quest, index) => `§7${index + 1}. ${quest.description}`)
      .join("\n");
    form.body(`§l§o§fAvailable Quests:\n\n${questDescriptions}`);
    randomQuests.forEach((quest) => {
      form.button(`§d§l${quest.description}`);
    });
  } else {
    form.body("§l§o§fNo quests available. Check back later or interact with NPCs to unlock quests.");
  }

  form.button("§c§lBack");

  form.show(player)
    .then((response) => {
      if (response && response.selection !== undefined) {
        if (activeQuest && response.selection === 0) {
          showQuitConfirmation(player, activeQuest, isNpcInteraction);
          return;
        }

        const backIndex = activeQuest ? 1 : randomQuests.length;
        if (response.selection === backIndex) {
          if (!isNpcInteraction) {
            main(player);
          }
          return;
        }

        const selectedQuestIndex = activeQuest ? response.selection - 1 : response.selection;
        const selectedQuest = randomQuests[selectedQuestIndex];
        const currentDate = getCurrentUTCDate();
        const lastCompletionDate = player.getDynamicProperty(`last${selectedQuest.property}`);

        if (lastCompletionDate === currentDate) {
          player.sendMessage(`§cYou can only complete the "${selectedQuest.description}" quest once per day.`);
          return;
        }

        if (selectedQuest.objective.type === "location") {
          const patrolLocationData = world.getDynamicProperty("patrolLocation");
          if (!patrolLocationData) {
            player.sendMessage("§cPatrol location data is missing. This quest cannot be started.");
            return;
          }
        }

        if (selectedQuest.objective.type === "maintain_balance") {
          startMaintainBalanceQuest(player, selectedQuest)
        }

        player.setDynamicProperty("activeQuest", JSON.stringify(selectedQuest));
        player.sendMessage(`§aYou have accepted the quest: ${selectedQuest.description}`);
        log(`${player.nameTag} accepted: ${selectedQuest.description}`, LOG_LEVELS.INFO);
      }
    })
    .catch((error) => {
      log(`Error in giveQuest: ${error.message}`, LOG_LEVELS.ERROR, {
        player: player.nameTag,
        error: error.stack,
      });
    });
}

function showQuitConfirmation(player, activeQuest, isNpcInteraction) {
    const confirmForm = new ActionFormData()
        .title("§l§1Quit Quest?")
        .body(`§l§o§fAre you sure you want to quit the quest:\n\n§a${activeQuest.description}?`)
        .button("§aYES")
        .button("§c§lNo");

    confirmForm.show(player)
        .then(response => {
            if (response && response.selection !== undefined) {
                if (response.selection === 0) {
                    if (activeQuest.objective.type === "maintain_balance") {
                        player.setDynamicProperty(`balanceStartTime_${activeQuest.property}`, null);
                    }
                    player.setDynamicProperty("activeQuest", null);
                    player.sendMessage("§aYou have quit your current quest.");
                    log(`${player.nameTag} quit their quest: ${activeQuest.description}`, LOG_LEVELS.INFO);
                } else {
                    giveQuest(player, isNpcInteraction);
                }
            }
        })
        .catch(error => {
            log(`Error in showQuitConfirmation: ${error}`, LOG_LEVELS.ERROR, player.nameTag, error.stack);
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
    shuffledQuests.forEach((quest) => {
        if (!questsByType[quest.objective.type]) {
            questsByType[quest.objective.type] = [];
        }
        questsByType[quest.objective.type].push(quest);
    });

    const selectedQuests = [];
    Object.keys(questsByType).forEach((type) => {
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
        selectedQuests.push(bestQuest);
    });

    return selectedQuests.slice(0, count);
}

export function getActiveQuest(player) {
    const activeQuestString = player.getDynamicProperty("activeQuest");
    //log(`[${player.nameTag}] Active Quest String (raw): ${activeQuestString}`, LOG_LEVELS.DEBUG);

    if (!activeQuestString) {
        //log(`[${player.nameTag}] No active quest string (returning null).`, LOG_LEVELS.DEBUG);
        return null;
    }

    try {
        const activeQuest = JSON.parse(activeQuestString);
        //log(`[${player.nameTag}] Active Quest (parsed): ${JSON.stringify(activeQuest)}`, LOG_LEVELS.DEBUG);
        if (!activeQuest || !activeQuest.objective || !activeQuest.property) {
            log(`[${player.nameTag}] Invalid quest object structure: ${JSON.stringify(activeQuest)}`, LOG_LEVELS.ERROR);
            player.setDynamicProperty("activeQuest", null);
            return null;
        }
        return activeQuest;
    } catch (error) {
        log(`[${player.nameTag}] Error parsing activeQuest: ${error}`, LOG_LEVELS.ERROR, player.nameTag, activeQuestString, error.stack);
        player.setDynamicProperty("activeQuest", null);
        return null;
    }
}

export function completeQuest(player, activeQuest) {
    if (activeQuest && activeQuest.reward) {
        const reward = activeQuest.reward;

        if (reward.type === "Moneyz") {
            player.runCommandAsync(`playsound random.levelup @s ~ ~ ~`);
            updateScore(player, reward.amount, "add");
            player.sendMessage(`§aYou completed the quest and earned ${reward.amount} Moneyz!`);
        } else if (reward.type === "item") {
            player.runCommandAsync(`playsound random.levelup @s ~ ~ ~`);
            player.runCommandAsync(`give @s ${reward.itemStack.typeId} ${reward.itemStack.amount}`);
            player.sendMessage(`§aYou completed the quest and earned ${reward.itemStack.amount} ${reward.itemStack.typeId.replace("minecraft:", "")}!`);
        } else if (reward.type === "experience") {
            player.runCommandAsync(`playsound random.levelup @s ~ ~ ~`);
            player.runCommandAsync(`xp ${reward.amount} @s`);
            player.sendMessage(`§aYou completed the quest and earned ${reward.amount} Experience!`);
        }

        const currentDate = getCurrentUTCDate();
        player.setDynamicProperty(`last${activeQuest.property}`, currentDate);
        player.setDynamicProperty("activeQuest", null);

        log(`Player ${player.nameTag} completed the quest: ${activeQuest.description}`, LOG_LEVELS.INFO);
    } else {
        log('Invalid quest structure (missing reward or activeQuest) for player:', LOG_LEVELS.WARN, player.nameTag, activeQuest);
    }
}

log('quest_menu.js loaded', LOG_LEVELS.DEBUG);
