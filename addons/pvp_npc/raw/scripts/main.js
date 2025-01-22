import { world, system, ItemStack, ItemTypes, EntityComponentTypes } from "@minecraft/server";
import { log, LOG_LEVELS } from "./logger.js";

const LOOT_POOLS = {
    potions: {
        min: 1,
        max: 3,
        items: [
            { typeId: "minecraft:potion", min: 1, max: 2, weight: 5 },
            { typeId: "minecraft:lingering_potion", min: 1, max: 1, weight: 3 },
            { typeId: "minecraft:splash_potion", min: 1, max: 3, weight: 2 },
        ],
    },
    food: {
        min: 2,
        max: 5,
        items: [
            { typeId: "minecraft:apple", min: 1, max: 4, weight: 6 },
            { typeId: "minecraft:bread", min: 1, max: 3, weight: 4 },
            { typeId: "minecraft:cooked_beef", min: 2, max: 5, weight: 5 },
        ],
    },
    armor: {
        min: 1,
        max: 2,
        items: [
            { typeId: "minecraft:diamond_helmet", min: 1, max: 1, weight: 4, enchantable: true },
            { typeId: "minecraft:iron_chestplate", min: 1, max: 1, weight: 3, enchantable: true },
            { typeId: "minecraft:netherite_boots", min: 1, max: 1, weight: 2, enchantable: true },
        ],
    },
    weapons: {
        min: 1,
        max: 2,
        items: [
            { typeId: "minecraft:diamond_sword", min: 1, max: 1, weight: 5, enchantable: true },
            { typeId: "minecraft:bow", min: 1, max: 2, weight: 3, enchantable: true },
            { typeId: "minecraft:crossbow", min: 1, max: 1, weight: 2, enchantable: true },
        ],
    },
    other: {
        min: 2,
        max: 4,
        items: [
            { typeId: "minecraft:emerald", min: 1, max: 5, weight: 5 },
            { typeId: "minecraft:diamond", min: 1, max: 3, weight: 3 },
            { typeId: "minecraft:gold_ingot", min: 2, max: 6, weight: 4 },
        ],
    },
};

const COOLDOWN_SECONDS = 300; // Cooldown duration

// Event handler for NPC interaction
world.beforeEvents.playerInteractWithEntity.subscribe((data) => {
    const player = data.player;
    const targetEntity = data.target;

    if (!player || !targetEntity || targetEntity.typeId !== "minecraft:npc") return;

    handleLootInteraction(player);
    data.cancel = true; // Prevent further interaction
});

function handleLootInteraction(player) {
    const now = Date.now();
    const cooldownKey = "lootCooldown";
    const lastLootTime = player.getDynamicProperty(cooldownKey) || 0;

    if (now - lastLootTime < COOLDOWN_SECONDS * 1000) {
        const remainingTime = Math.ceil((COOLDOWN_SECONDS * 1000 - (now - lastLootTime)) / 1000);
        player.sendMessage(`§cWait ${remainingTime} seconds before looting again.`);
        return;
    }

    const loot = generateLoot();
    distributeLoot(player, loot);

    player.setDynamicProperty(cooldownKey, now);
    player.sendMessage("§aYou received your loot!");
    log(`${player.nameTag} received loot.`, LOG_LEVELS.INFO);
}

function generateLoot() {
    const loot = {};

    for (const category in LOOT_POOLS) {
        const pool = LOOT_POOLS[category];
        const itemCount = getRandomInRange(pool.min, pool.max);
        loot[category] = selectRandomItems(pool.items, itemCount);
    }

    return loot;
}

function distributeLoot(player, loot) {
    const inventory = player.getComponent(EntityComponentTypes.Inventory)?.container;

    if (!inventory) {
        log(`Player ${player.nameTag} does not have an inventory.`, LOG_LEVELS.ERROR);
        return;
    }

    for (const category in loot) {
        loot[category].forEach((item) => {
            const itemType = ItemTypes.get(item.typeId);
            if (!itemType) {
                log(`Invalid item type: ${item.typeId}`, LOG_LEVELS.ERROR);
                return;
            }

            const itemStack = new ItemStack(itemType, item.quantity);

            system.run(() => {
                try {
                    inventory.addItem(itemStack);
                    log(`Gave ${item.quantity}x ${item.typeId} to ${player.nameTag}.`, LOG_LEVELS.INFO);

                    //if (item.enchantable) {
                    //    enchantItem(itemStack);
                    //}
                } catch (error) {
                    log(`Error adding ${item.typeId} to inventory: ${error}`, LOG_LEVELS.ERROR);
                }
            });
        });
    }
}


//function enchantItem(itemStack) {
//}

function selectRandomItems(poolItems, count) {
    const weightedPool = createWeightedPool(poolItems);
    const selectedItems = [];

    for (let i = 0; i < count; i++) {
        if (weightedPool.length === 0) break;

        const randomIndex = Math.floor(Math.random() * weightedPool.length);
        const selectedItem = weightedPool.splice(randomIndex, 1)[0];

        selectedItems.push({
            ...selectedItem,
            quantity: getRandomInRange(selectedItem.min, selectedItem.max),
        });
    }

    return selectedItems;
}

function createWeightedPool(items) {
    return items.flatMap((item) => Array(item.weight).fill(item));
}

function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

log("Loot system initialized successfully.", LOG_LEVELS.DEBUG);
