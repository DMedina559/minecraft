export const ORE_BREAK_REWARDS = Object.freeze({
  "minecraft:coal_ore":5,"minecraft:deepslate_coal_ore":5,"minecraft:copper_ore":8,"minecraft:deepslate_copper_ore":8,
  "minecraft:iron_ore":10,"minecraft:deepslate_iron_ore":10,"minecraft:gold_ore":20,"minecraft:deepslate_gold_ore":20,
  "minecraft:diamond_ore":50,"minecraft:deepslate_diamond_ore":50,"minecraft:emerald_ore":75,"minecraft:deepslate_emerald_ore":75,
  "minecraft:lapis_ore":15,"minecraft:deepslate_lapis_ore":15,"minecraft:redstone_ore":12,"minecraft:deepslate_redstone_ore":12,
  "minecraft:nether_gold_ore":10,"minecraft:quartz_ore":10
});
export const MOB_REWARDS = Object.freeze({"minecraft:spider":15,"minecraft:zombie":25,"minecraft:skeleton":30,"minecraft:creeper":50,"minecraft:enderman":100});
export const FARM_ANIMALS = Object.freeze({"minecraft:cow":15,"minecraft:sheep":10,"minecraft:pig":10,"minecraft:chicken":5,"minecraft:rabbit":5});
export const CROP_PLANT_REWARDS = Object.freeze({"minecraft:wheat":3,"minecraft:potatoes":3,"minecraft:carrots":3,"minecraft:beetroot":3,"minecraft:reeds":3});

const money = amount => ({type:"Moneyz",amount});
const q=(id,description,property,objective,reward,tags)=>Object.freeze({id,description,property,objective:Object.freeze(objective),reward:Object.freeze(reward),...(tags?{tags:Object.freeze(tags)}:{})});
export const QUEST_DATA=Object.freeze([
 q("slay_5","Eliminate 5 Hostile Mobs","Slay5",{type:"slay",entityTypes:Object.keys(MOB_REWARDS),count:5},money(250)),
 q("slay_10","Eliminate 10 Hostile Mobs","Slay10",{type:"slay",entityTypes:Object.keys(MOB_REWARDS),count:10},money(500)),
 q("slay_15","Eliminate 15 Hostile Mobs","Slay15",{type:"slay",entityTypes:Object.keys(MOB_REWARDS),count:15},money(750)),
 q("slay_50","Eliminate 50 Hostile Mobs","Slay50",{type:"slay",entityTypes:Object.keys(MOB_REWARDS),count:50},money(1500)),
 q("patrol_200","Patrol the Area (200 Blocks)","Patrol200",{type:"location",minAreaCovered:200},money(100)),
 q("patrol_350","Patrol the Area (350 Blocks)","Patrol350",{type:"location",minAreaCovered:350},money(150)),
 q("patrol_500","Patrol the Area (500 Blocks)","Patrol500",{type:"location",minAreaCovered:500},money(250)),
 q("patrol_1000","Patrol the Area (1000 Blocks)","Patrol1000",{type:"location",minAreaCovered:1000},money(500)),
 q("slaughter_5","Slaughter 5 Farm Animals","Slaughter5",{type:"slaughter",entityTypes:Object.keys(FARM_ANIMALS),count:5},money(100)),
 q("slaughter_10","Slaughter 10 Farm Animals","Slaughter10",{type:"slaughter",entityTypes:Object.keys(FARM_ANIMALS),count:10},money(150)),
 q("slaughter_15","Slaughter 15 Farm Animals","Slaughter15",{type:"slaughter",entityTypes:Object.keys(FARM_ANIMALS),count:15},money(200)),
 q("slaughter_50","Slaughter 50 Farm Animals","Slaughter50",{type:"slaughter",entityTypes:Object.keys(FARM_ANIMALS),count:50},money(500)),
 q("plant_5","Plant 5 Crops","Plant5",{type:"plant",cropTypes:Object.keys(CROP_PLANT_REWARDS),count:5},money(50)),
 q("plant_10","Plant 10 Crops","Plant10",{type:"plant",cropTypes:Object.keys(CROP_PLANT_REWARDS),count:10},money(100)),
 q("plant_20","Plant 20 Crops","Plant20",{type:"plant",cropTypes:Object.keys(CROP_PLANT_REWARDS),count:20},money(150)),
 q("plant_100","Plant 100 Crops","Plant100",{type:"plant",cropTypes:Object.keys(CROP_PLANT_REWARDS),count:100},money(350)),
 q("mine_10","Mine 10 Ores","Mine10",{type:"break",blockTypes:Object.keys(ORE_BREAK_REWARDS),count:10},money(300)),
 q("mine_15","Mine 15 Ores","Mine15",{type:"break",blockTypes:Object.keys(ORE_BREAK_REWARDS),count:15},money(450)),
 q("mine_20","Mine 20 Ores","Mine20",{type:"break",blockTypes:Object.keys(ORE_BREAK_REWARDS),count:20},money(600)),
 q("mine_50","Mine 50 Ores","Mine50",{type:"break",blockTypes:Object.keys(ORE_BREAK_REWARDS),count:50},money(1000)),
 q("maintain_1000_5m","Maintain 1000 Moneyz for 5 Minutes","Maintain1000For5Min",{type:"maintain_balance",amount:1000,duration:300000},money(200)),
 q("maintain_5000_5m","Maintain 5000 Moneyz for 5 Minutes","Maintain5000For5Min",{type:"maintain_balance",amount:5000,duration:300000},money(500)),
 q("maintain_1000_20m","Maintain 1000 Moneyz for 20 Minutes","Maintain1000For20Min",{type:"maintain_balance",amount:1000,duration:1200000},money(300)),
 q("maintain_5000_20m","Maintain 5000 Moneyz for 20 Minutes","Maintain5000For20Min",{type:"maintain_balance",amount:5000,duration:1200000},money(300)),
 q("maintain_50000_60m","Maintain 50000 Moneyz for 60 Minutes","Maintain50000For60Min",{type:"maintain_balance",amount:50000,duration:3600000},money(500))
]);
export const QUEST_BY_ID=new Map(QUEST_DATA.map(x=>[x.id,x]));
export const QUEST_BY_PROPERTY=new Map(QUEST_DATA.map(x=>[x.property,x]));
