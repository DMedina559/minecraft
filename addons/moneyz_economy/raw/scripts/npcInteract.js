import { world, system } from "@minecraft/server";
import { customShop } from "./gui/custom_shop.js";
import { openRewardsMenu } from "./gui/rewards_menu.js";
import { luckyPurchase } from './gui/lucky_purchase.js';
import { testYourLuck } from "./games/randomNum.js";
import { start21Game } from "./games/21Game.js";
import { startCrapsGame } from "./games/diceGame.js";
import { startSlotsGame } from "./games/slotGame.js";
import { log, LOG_LEVELS } from "./logger.js";

// Open JS Menu when Player interact with NPC that matches the required Name
world.beforeEvents.playerInteractWithEntity.subscribe((data) => {
    const player = data.player;
    const targetEntity = data.target;

    if (!player || !targetEntity) {
        log("Player or target entity is undefined. Unable to handle interaction.", LOG_LEVELS.ERROR);
        return;
    }

    const npcCustomShop = world.getDynamicProperty("customShop") || "Custom Shop";
    const npcRewards = world.getDynamicProperty("npcRewards") || "Daily Rewards";
    const npcLuckyP = world.getDynamicProperty("npcLuckyP") || "Lucky Purchase";
    const npc21Game = world.getDynamicProperty("npc21") || "21";
    const npcTestLuck = world.getDynamicProperty("npcTestLuck") || "Test Luck";
    const npcDiceGame = world.getDynamicProperty("npcDice") || "Dice";
    const npcSlotsGame = world.getDynamicProperty("npcSlots") || "Slots";

    const npcName = targetEntity.nameTag ? targetEntity.nameTag : "Unnamed NPC";
    log(`Interacted with NPC: ${npcName}`, LOG_LEVELS.INFO);

    if (targetEntity.typeId === "minecraft:npc") {
        log(`Player object: ${JSON.stringify(player)}`, LOG_LEVELS.DEBUG);
        log(`Target entity object: ${JSON.stringify(targetEntity)}`, LOG_LEVELS.DEBUG);

        const isNpcInteraction = true;
        
        // Open corresponding menu based on NPC name
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
        } else {
        
        }
    } else {
    
    }
});
