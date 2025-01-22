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
        weight: 2,
        min: 2,
        max: 5,
        items: [
            { typeId: "minecraft:apple", min: 1, max: 4, weight: 6 },
            { typeId: "minecraft:bread", min: 1, max: 3, weight: 4 },
            { typeId: "minecraft:cooked_beef", min: 2, max: 5, weight: 5 },
        ],
    },
    {
        name: "armor",
        weight: 4,
        min: 1,
        max: 2,
        subPools: [
            {
                name: "helmets",
                weight: 4,
                min: 1,
                max: 2,
                items: [
                    { typeId: "minecraft:diamond_helmet", min: 1, max: 1, weight: 5, enchantable: true },
                    { typeId: "minecraft:iron_helmet", min: 1, max: 1, weight: 3, enchantable: true },
                ],
            },
            {
                name: "chestplates",
                weight: 3,
                min: 1,
                max: 1,
                items: [
                    { typeId: "minecraft:iron_chestplate", min: 1, max: 1, weight: 4, enchantable: true },
                    { typeId: "minecraft:netherite_chestplate", min: 1, max: 1, weight: 2, enchantable: true },
                ],
            },
            {
                name: "leggings",
                weight: 2,
                min: 1,
                max: 2,
                items: [
                    { typeId: "minecraft:diamond_leggings", min: 1, max: 1, weight: 4, enchantable: true },
                    { typeId: "minecraft:iron_leggings", min: 1, max: 1, weight: 3, enchantable: true },
                ],
            },
            {
                name: "boots",
                weight: 1,
                min: 1,
                max: 1,
                items: [
                    { typeId: "minecraft:netherite_boots", min: 1, max: 1, weight: 2, enchantable: true },
                    { typeId: "minecraft:iron_boots", min: 1, max: 1, weight: 3, enchantable: true },
                ],
            },
        ],
    },
    {
        name: "weapons",
        weight: 5,
        min: 1,
        max: 2,
        items: [
            { typeId: "minecraft:diamond_sword", min: 1, max: 1, weight: 5, enchantable: true },
            { typeId: "minecraft:bow", min: 1, max: 2, weight: 3, enchantable: true },
            { typeId: "minecraft:crossbow", min: 1, max: 1, weight: 2, enchantable: true },
        ],
    },
    {
        name: "other",
        weight: 1,
        min: 2,
        max: 4,
        items: [
            { typeId: "minecraft:arrow", min: 3, max: 5, weight: 5 }
        ],
    },
];