import { world, system } from "@minecraft/server";
import { customShop } from "./gui/custom_shop.js";
import { openRewardsMenu } from "./gui/rewards_menu.js";
import { giveQuest } from "./gui/quest_menu.js";
import { luckyPurchase } from "./gui/lucky_purchase.js";
import { testYourLuck } from "./games/randomNum.js";
import { start21Game } from "./games/21Game.js";
import { startCrapsGame } from "./games/diceGame.js";
import { startSlotsGame } from "./games/slotGame.js";
import { log, LOG_LEVELS } from "./logger.js";

// Handles NPC interaction events to trigger Moneyz Economy menus
world.beforeEvents.playerInteractWithEntity.subscribe((data) => {
    const player = data.player;
    const targetEntity = data.target;

    if (!player || !targetEntity) return;

    if (targetEntity.typeId === "minecraft:npc") {
        const npcCustomShop = world.getDynamicProperty("customShop") || "Custom Shop";
        const npcRewards = world.getDynamicProperty("npcRewards") || "Daily Rewards";
        const npcLuckyP = world.getDynamicProperty("npcLuckyP") || "Lucky Purchase";
        const npc21Game = world.getDynamicProperty("npc21") || "21";
        const npcTestLuck = world.getDynamicProperty("npcTestLuck") || "Test Luck";
        const npcDiceGame = world.getDynamicProperty("npcDice") || "Dice";
        const npcSlotsGame = world.getDynamicProperty("npcSlots") || "Slots";
        const npcQuest = world.getDynamicProperty("npcQuest") || "Quest Giver";

        const npcName = targetEntity.nameTag || "Unnamed NPC";
        const isNpcInteraction = true;

        if (npcName === npcCustomShop) {
            data.cancel = true;
            system.run(() => customShop(player, isNpcInteraction));
        } else if (npcName === npcRewards) {
            data.cancel = true;
            system.run(() => openRewardsMenu(player, isNpcInteraction));
        } else if (npcName === npcLuckyP) {
            data.cancel = true;
            system.run(() => luckyPurchase(player, isNpcInteraction));
        } else if (npcName === npc21Game) {
            data.cancel = true;
            system.run(() => start21Game(player, isNpcInteraction));
        } else if (npcName === npcTestLuck) {
            data.cancel = true;
            system.run(() => testYourLuck(player, isNpcInteraction));
        } else if (npcName === npcDiceGame) {
            data.cancel = true;
            system.run(() => startCrapsGame(player, isNpcInteraction));
        } else if (npcName === npcSlotsGame) {
            data.cancel = true;
            system.run(() => startSlotsGame(player, isNpcInteraction));
        } else if (npcName === npcQuest) {
            data.cancel = true;
            system.run(() => giveQuest(player, isNpcInteraction));
        }
    }
});

log("npcInteract.js initialized", LOG_LEVELS.DEBUG);
