import { ORE_BREAK_REWARDS } from './quest/mine.js'
import { MOB_REWARDS } from './quest/slay.js'
import { FARM_ANIMALS } from './quest/slaughter.js'
import { CROP_PLANT_REWARDS } from './quest/plant.js'

export const QUEST_DATA = [
//reward: { type: "item", itemStack: { typeId: "minecraft:diamond", amount: 5 } }
//reward: { type: "Moneyz", amount: 500 }
//reward: {type: "experience" amount:"5L"} 
    {
        description: "Eliminate 5 Hostile Mobs",
        property: "Slay5",
        objective: { type: "slay", entityTypes: Object.keys(MOB_REWARDS), count: 5 },
        reward: { type: "Moneyz", amount: 250 },
//        tags: ["cop"]
    },
    {
        description: "Eliminate 10 Hostile Mobs",
        property: "Slay10",
        objective: { type: "slay", entityTypes: Object.keys(MOB_REWARDS), count: 10 },
        reward: { type: "Moneyz", amount: 500 },
//        tags: ["cop"]
    },
    {
        description: "Eliminate 15 Hostile Mobs",
        property: "Slay15",
        objective: { type: "slay", entityTypes: Object.keys(MOB_REWARDS), count: 15 },
        reward: { type: "Moneyz", amount: 750 },
//        tags: ["cop"]
    },
    {
        description: "Eliminate 50 Hostile Mobs",
        property: "Slay15",
        objective: { type: "slay", entityTypes: Object.keys(MOB_REWARDS), count: 50 },
        reward: { type: "Moneyz", amount: 1500 },
//        tags: ["cop"]
    },
    {
        description: "Patrol the Area (200 Blocks)",
        property: "Patrol200",
        objective: { type: "location", minAreaCovered: 200 },
        reward: { type: "Moneyz", amount: 100 },
//        tags: ["cop"]
    },
    {
        description: "Patrol the Area (350 Blocks)",
        property: "Patrol350",
        objective: { type: "location", minAreaCovered: 350 },
        reward: { type: "Moneyz", amount: 150 },
//        tags: ["cop"]
    },
    {
        description: "Patrol the Area (500 Blocks)",
        property: "Patrol500",
        objective: { type: "location", minAreaCovered: 500 },
        reward: { type: "Moneyz", amount: 250 },
//        tags: ["cop"]
    },
    {
        description: "Patrol the Area (1000 Blocks)",
        property: "Patrol1000",
        objective: { type: "location", minAreaCovered: 1000 },
        reward: { type: "Moneyz", amount: 500 },
//        tags: ["cop"]
    },
    {
        description: "Slaughter 5 Farm Animals",
        property: "Slaughter5",
        objective: { type: "slaughter", entityTypes: Object.keys(FARM_ANIMALS), count: 5 },
        reward: { type: "Moneyz", amount: 100 },
//        tags: ["farmer"]
    },
    {
        description: "Slaughter 10 Farm Animals",
        property: "Slaughter10",
        objective: { type: "slaughter", entityTypes: Object.keys(FARM_ANIMALS), count: 10 },
        reward: { type: "Moneyz", amount: 150 },
//        tags: ["farmer"]
    },
    {
        description: "Slaughter 15 Farm Animals",
        property: "Slaughter15",
        objective: { type: "slaughter", entityTypes: Object.keys(FARM_ANIMALS), count: 15 },
        reward: { type: "Moneyz", amount: 200 },
//        tags: ["farmer"]
    },
    {
        description: "Slaughter 50 Farm Animals",
        property: "Slaughter50",
        objective: { type: "slaughter", entityTypes: Object.keys(FARM_ANIMALS), count: 50 },
        reward: { type: "Moneyz", amount: 500 },
//        tags: ["farmer"]
    },
    {
        description: "Plant 5 Crops",
        property: "Plant5",
        objective: { type: "plant", cropTypes: Object.keys(CROP_PLANT_REWARDS), count: 5 },
        reward: { type: "Moneyz", amount: 50 },
//        tags: ["farmer"]
    },
    {
        description: "Plant 10 Crops",
        property: "Plant10",
        objective: { type: "plant", cropTypes: Object.keys(CROP_PLANT_REWARDS), count: 10 },
        reward: { type: "Moneyz", amount: 100 },
//        tags: ["farmer"]
    },
    {
        description: "Plant 20 Crops",
        property: "Plant20",
        objective: { type: "plant", cropTypes: Object.keys(CROP_PLANT_REWARDS), count: 20 },
        reward: { type: "Moneyz", amount: 150 },
//        tags: ["farmer"]
    },
    {
        description: "Plant 100 Crops",
        property: "Plant100",
        objective: { type: "plant", cropTypes: Object.keys(CROP_PLANT_REWARDS), count: 100 },
        reward: { type: "Moneyz", amount: 350 },
//        tags: ["farmer"]
    },
    {
        description: "Mine 10 Ores",
        property: "Mine10",
        objective: { type: "break", blockTypes: Object.keys(ORE_BREAK_REWARDS), count: 10 },
        reward: { type: "Moneyz", amount: 300 },
//        tags: ["miner"]
    },
    {
        description: "Mine 15 Ores",
        property: "Mine15",
        objective: { type: "break", blockTypes: Object.keys(ORE_BREAK_REWARDS), count: 15 },
        reward: { type: "Moneyz", amount: 450 },
//        tags: ["miner"]
    },
    {
        description: "Mine 20 Ores",
        property: "Mine20",
        objective: { type: "break", blockTypes: Object.keys(ORE_BREAK_REWARDS), count: 20 },
        reward: { type: "Moneyz", amount: 600 },
//        tags: ["miner"]
    },
    {
        description: "Mine 50 Ores",
        property: "Mine50",
        objective: { type: "break", blockTypes: Object.keys(ORE_BREAK_REWARDS), count: 50 },
        reward: { type: "Moneyz", amount: 1000 },
//        tags: ["miner"]
    },
    {
        description: "Maintain 1000 Moneyz for 5 Minute",
        property: "Maintain1000For5Min",
        objective: { type: "maintain_balance", amount: 1000, duration: 300000 },
        reward: { type: "Moneyz", amount: 200 },
//        tags: ["banker"]
    },
    {
        description: "Maintain 5000 Moneyz for 5 Minutes",
        property: "Maintain5000For5Min",
        objective: { type: "maintain_balance", amount: 5000, duration: 300000 },
        reward: { type: "Moneyz", amount: 500 },
//        tags: ["banker"]
    },
    {
        description: "Maintain 1000 Moneyz for 20 Minutes",
        property: "Maintain1000For20Min",
        objective: { type: "maintain_balance", amount: 1000, duration: 1200000 },
        reward: { type: "Moneyz", amount: 300 },
//        tags: ["banker"]
    },
    {
        description: "Maintain 5000 Moneyz for 20 Minutes",
        property: "Maintain5000For20Min",
        objective: { type: "maintain_balance", amount: 5000, duration: 1200000 },
        reward: { type: "Moneyz", amount: 300 },
//        tags: ["banker"]
    },
    {
        description: "Maintain 50000 Moneyz for 60 Minutes",
        property: "Maintain50000For60Min",
        objective: { type: "maintain_balance", amount: 50000, duration: 3600000 },
        reward: { type: "Moneyz", amount: 500 },
//        tags: ["banker"]
    }
];