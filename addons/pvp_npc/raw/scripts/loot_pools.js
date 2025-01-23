export const LOOT_POOLS = [
    /*/ 
    {
        name: "potions",
        weight: 3,
        min: 1,
        max: 3,
        items: [
            { typeId: "minecraft:potion", min: 1, max: 2, weight: 5 },
            { typeId: "minecraft:lingering_potion", min: 1, max: 1, weight: 3 },
            { typeId: "minecraft:splash_potion", min: 1, max: 3, weight: 2 },
        ],
    },
    /*/
    {
        name: "food",
        weight: 3,
        min: 2,
        max: 5,
        items: [
            { typeId: "minecraft:enchanted_golden_apple", min: 1, max: 1, weight: 1 },
            { typeId: "minecraft:apple", min: 3, max: 6, weight: 6 },
            { typeId: "minecraft:baked_potato", min: 4, max: 5, weight: 4 },
            { typeId: "minecraft:bread", min: 2, max: 3, weight: 4 },
            { typeId: "minecraft:chorus_fruit", min: 1, max: 3, weight: 2 },

            { typeId: "minecraft:cooked_beef", min: 2, max: 3, weight: 1 },
            { typeId: "minecraft:cooked_cod", min: 2, max: 5, weight: 2 },
            { typeId: "minecraft:cooked_salmon", min: 2, max: 5, weight: 2 },
            { typeId: "minecraft:cooked_chicken", min: 2, max: 3, weight: 1 },
            { typeId: "minecraft:cooked_porkchop", min: 2, max: 4, weight: 1 },
            { typeId: "minecraft:cooked_mutton", min: 2, max: 5, weight: 1 },
            { typeId: "minecraft:cooked_rabbit", min: 2, max: 6, weight: 2 },
        ],
    },
    {
        name: "armor",
        weight: 1,
        min: 1,
        max: 1,
        subPools: [
            {
                name: "helmets",
                weight: 1,
                min: 1,
                max: 1,
                items: [
                    { typeId: "minecraft:diamond_helmet", min: 1, max: 1, weight: 1, enchantable: true },
                    { typeId: "minecraft:iron_helmet", min: 1, max: 1, weight: 2, enchantable: true },
                    { typeId: "minecraft:golden_helmet", min: 1, max: 1, weight: 3, enchantable: true },
                    { typeId: "minecraft:leather_helmet", min: 1, max: 1, weight: 4, enchantable: true }
                ],
            },
            {
                name: "chestplates",
                weight: 1,
                min: 1,
                max: 1,
                items: [
                    { typeId: "minecraft:diamond_chestplate", min: 1, max: 1, weight: 1, enchantable: true },
                    { typeId: "minecraft:iron_chestplate", min: 1, max: 1, weight: 2, enchantable: true },
                    { typeId: "minecraft:golden_chestplate", min: 1, max: 1, weight: 3, enchantable: true },
                    { typeId: "minecraft:leather_chestplate", min: 1, max: 1, weight: 4, enchantable: true }
                ],
            },
            {
                name: "leggings",
                weight: 1,
                min: 1,
                max: 1,
                items: [
                    { typeId: "minecraft:diamond_leggings", min: 1, max: 1, weight: 1, enchantable: true },
                    { typeId: "minecraft:iron_leggings", min: 1, max: 1, weight: 2, enchantable: true },
                    { typeId: "minecraft:golden_leggings", min: 1, max: 1, weight: 3, enchantable: true },
                    { typeId: "minecraft:leather_leggings", min: 1, max: 1, weight: 4, enchantable: true }
                ],
            },
            {
                name: "boots",
                weight: 1,
                min: 1,
                max: 1,
                items: [
                    { typeId: "minecraft:diamond_boots", min: 1, max: 1, weight: 1, enchantable: true },
                    { typeId: "minecraft:iron_boots", min: 1, max: 1, weight: 2, enchantable: true },
                    { typeId: "minecraft:golden_boots", min: 1, max: 1, weight: 3, enchantable: true },
                    { typeId: "minecraft:leather_boots", min: 1, max: 1, weight: 4, enchantable: true }
                ],
            },
        ],
    },
    {
        name: "weapons",
        weight: 2,
        min: 1,
        max: 2,
        items: [
            { typeId: "minecraft:diamond_sword", min: 1, max: 1, weight: 1, enchantable: true },
            { typeId: "minecraft:iron_sword", min: 1, max: 1, weight: 2, enchantable: true },
            { typeId: "minecraft:wooden_sword", min: 1, max: 1, weight: 3, enchantable: true },
            { typeId: "minecraft:bow", min: 1, max: 2, weight: 3, enchantable: true },
            { typeId: "minecraft:crossbow", min: 1, max: 1, weight: 2, enchantable: true }
        ],
    },
    {
        name: "other",
        weight: 2,
        min: 2,
        max: 4,
        items: [
            { typeId: "minecraft:arrow", min: 3, max: 7, weight: 5 },
            { typeId: "minecraft:ender_pearl", min: 3, max: 5, weight: 3 },
            { typeId: "minecraft:shield", min: 3, max: 7, weight: 5 },
        ],
    },
];