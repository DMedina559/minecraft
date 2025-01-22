import { world, system, ItemStack, ItemTypes, EntityComponentTypes } from "@minecraft/server";
import { LOOT_POOLS } from "./loot_pools.js";
import { log, LOG_LEVELS } from "./logger.js";

const COOLDOWN_SECONDS = world.getDynamicProperty("npcCooldown") || "300";

world.beforeEvents.playerInteractWithEntity.subscribe((data) => {
    const player = data.player;
    const targetEntity = data.target;

    if (!player || !targetEntity || targetEntity.typeId !== "minecraft:npc") return;

    handleLootInteraction(player);
    data.cancel = true;
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

    const poolCount = getRandomInRange(3, 6);
    const selectedPools = selectMultiplePools(LOOT_POOLS, poolCount);

    selectedPools.forEach((selectedPool) => {
        const loot = generateLoot(selectedPool);
        distributeLoot(player, loot);
        log(`${player.nameTag} received loot from pool: ${selectedPool.name}.`, LOG_LEVELS.INFO);
    });

    player.setDynamicProperty(cooldownKey, now);
    player.sendMessage("§aYou received your loot!");
}

function selectMultiplePools(pools, count) {
    const weightedPool = createWeightedPool(pools);
    const selectedPools = [];

    for (let i = 0; i < count; i++) {
        if (weightedPool.length === 0) break;

        const randomIndex = Math.floor(Math.random() * weightedPool.length);
        selectedPools.push(weightedPool.splice(randomIndex, 1)[0]);
    }

    return selectedPools;
}

function selectRandomPool(pools) {
    const weightedPool = createWeightedPool(pools);
    return weightedPool[Math.floor(Math.random() * weightedPool.length)];
}

function generateLoot(pool) {
    const loot = [];

    if (pool.subPools) {
        const subPool = selectRandomSubPool(pool.subPools);
        const itemCount = getRandomInRange(subPool.min, subPool.max);
        loot.push(...selectRandomItems(subPool.items, itemCount));
    } else {
        const itemCount = getRandomInRange(pool.min, pool.max);
        loot.push(...selectRandomItems(pool.items, itemCount));
    }

    return loot;
}

function distributeLoot(player, loot) {
    const inventory = player.getComponent(EntityComponentTypes.Inventory)?.container;

    if (!inventory) {
        log(`Player ${player.nameTag} does not have an inventory.`, LOG_LEVELS.ERROR);
        return;
    }

    loot.forEach((item) => {
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

//function enchantItem(itemStack) {
//}

function selectRandomSubPool(subPools) {
    const weightedPool = createWeightedPool(subPools);
    return weightedPool[Math.floor(Math.random() * weightedPool.length)];
}

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

log("PVP NPC loaded.", LOG_LEVELS.DEBUG);
