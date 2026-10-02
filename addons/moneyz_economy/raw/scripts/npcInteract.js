import { world, system } from "@minecraft/server";
import { customShop } from "./gui/custom_shop.js";
import { openRewardsMenu } from "./gui/rewards_menu.js";
import { giveQuest } from "./gui/quest_menu.js";
import { luckyPurchase } from "./gui/lucky_purchase.js";
import { testYourLuck } from "./games/randomNum.js";
import { start21Game } from "./games/21Game.js";
import { startCrapsGame } from "./games/diceGame.js";
import { startSlotsGame } from "./games/slotGame.js";
import { main } from "./gui/moneyz_menu.js";
import { log, LOG_LEVELS } from "./logger.js";
import * as Config from "./core/config.js";
import * as NpcMenus from "./api/npc_menus.js";

let registered=false;
export function registerBuiltInNpcMenus(){if(registered)return;registered=true;
 NpcMenus.registerMenu("moneyz:menu",p=>main(p),{label:"Moneyz Menu"});
 NpcMenus.registerMenu("moneyz:custom_shop",p=>customShop(p,true),{label:"Custom Shop"});
 NpcMenus.registerMenu("moneyz:daily_rewards",p=>openRewardsMenu(p,true),{label:"Daily Rewards"});
 NpcMenus.registerMenu("moneyz:lucky_purchase",p=>luckyPurchase(p,true),{label:"Lucky Purchase"});
 NpcMenus.registerMenu("moneyz:blackjack",p=>start21Game(p,true),{label:"21 / Blackjack"});
 NpcMenus.registerMenu("moneyz:test_luck",p=>testYourLuck(p,true),{label:"Test Your Luck"});
 NpcMenus.registerMenu("moneyz:craps",p=>startCrapsGame(p,true),{label:"Dice / Craps"});
 NpcMenus.registerMenu("moneyz:slots",p=>startSlotsGame(p,true),{label:"Slots"});
 NpcMenus.registerMenu("moneyz:quests",p=>giveQuest(p,true),{label:"Quests"});
}
registerBuiltInNpcMenus();
world.beforeEvents.playerInteractWithEntity.subscribe(data=>{const player=data.player,target=data.target;if(!player||target?.typeId!=="minecraft:npc")return;
 if(NpcMenus.assigned(target)){data.cancel=true;system.run(()=>{if(!NpcMenus.dispatch(player,target))player.sendMessage("§cThis NPC references an unavailable Moneyz menu.");});return;}
 const legacy=[["customShop","Custom Shop",()=>customShop(player,true)],["npcRewards","Daily Rewards",()=>openRewardsMenu(player,true)],["npcLuckyP","Lucky Purchase",()=>luckyPurchase(player,true)],["npc21","21",()=>start21Game(player,true)],["npcTestLuck","Test Luck",()=>testYourLuck(player,true)],["npcDice","Dice",()=>startCrapsGame(player,true)],["npcSlots","Slots",()=>startSlotsGame(player,true)],["npcQuest","Quest Giver",()=>giveQuest(player,true)]];
 const name=target.nameTag||"";for(const [key,fallback,open] of legacy){if(name===Config.get(key,fallback)){data.cancel=true;system.run(open);return;}}
});
log("npcInteract.js initialized",LOG_LEVELS.DEBUG);
