import { world, system } from "@minecraft/server";
import { CustomForm } from "./ui/ddui.js";
import { customShop } from "./gui/custom_shop.js";
import { openRewardsMenu } from "./gui/rewards_menu.js";
import { giveQuest } from "./gui/quest_menu.js";
import { luckyPurchase } from "./gui/lucky_purchase.js";
import { luckyMenu } from "./gui/lucky_menu.js";
import { testYourLuck } from "./games/randomNum.js";
import { start21Game } from "./games/21Game.js";
import { startCrapsGame } from "./games/diceGame.js";
import { startSlotsGame } from "./games/slotGame.js";
import { main, shops as openAllShops } from "./gui/moneyz_menu.js";
import { openExchange } from "./gui/exchanges.js";
import { openSendMoney } from "./gui/send_money.js";
import { openHelp } from "./gui/help.js";
import { moneyzAdmin, balanceManage, tagManage, transactionView, diagnosticsView } from "./gui/admin_menu.js";
import { showShopEditorMenu } from "./gui/shop_editor.js";
import { npcManager } from "./gui/npc_manager.js";
import { moneyzSettings } from "./gui/settings.js";
import { propertiesMenu } from "./gui/properties_menu.js";
import { openShop } from "./gui/shop_v3.js";
import { openJobs, openPayroll, jobAdmin } from "./gui/jobs.js";
import { openProperties, propertyAdmin } from "./gui/properties.js";
import { openHotel } from "./gui/reservations.js";
import { openProducts, productAdmin } from "./gui/products.js";
import { exchangeAdmin } from "./gui/exchanges.js";
import { setupWizard } from "./gui/setup_wizard.js";
import { log, LOG_LEVELS } from "./logger.js";
import * as Config from "./core/config.js";
import * as Jobs from "./core/jobs.js";
import * as Permissions from "./core/permissions.js";
import * as NpcMenus from "./api/npc_menus.js";
import * as NpcShops from "./api/npc_shops.js";
import * as NpcServices from "./api/npc_services.js";
import * as Services from "./api/services.js";
let registered=false;
const admin=p=>Permissions.has(p,"moneyz.admin");
export function registerBuiltInNpcMenus(){if(registered)return;registered=true;
 const defs=[
  ["moneyz:menu","Moneyz Menu","general",p=>main(p)], ["moneyz:help","Help","general",p=>openHelp(p)], ["moneyz:shops","All Shops","economy",p=>openAllShops(p)],
  ["moneyz:atm","ATM / Exchange","economy",p=>openExchange(p),p=>Config.bool("moneyzATM",true,p)], ["moneyz:jobs","Jobs / Employment","roleplay",p=>openJobs(p)], ["moneyz:payroll","Worker Payroll","roleplay",p=>openPayroll(p),p=>Jobs.canRunPayroll(p)], ["moneyz:realtor","Real Estate","roleplay",p=>openProperties(p)], ["moneyz:hotel","Hotel Services","roleplay",p=>openHotel(p)], ["moneyz:pets","Pet Shop","economy",p=>openProducts(p,{type:"pet"})], ["moneyz:products","Products & Services","economy",p=>openProducts(p)], ["moneyz:send","Send Moneyz","economy",p=>openSendMoney(p,true),p=>Config.bool("moneyzSend",true,p)],
  ["moneyz:custom_shop","Custom Shop","economy",p=>customShop(p,true)], ["moneyz:daily_rewards","Daily Rewards","rewards",p=>openRewardsMenu(p,true)], ["moneyz:quests","Quests","rewards",p=>giveQuest(p,true)],
  ["moneyz:lucky","Feeling Lucky","games",p=>luckyMenu(p)], ["moneyz:lucky_purchase","Lucky Purchase","games",p=>luckyPurchase(p,true)], ["moneyz:blackjack","21 / Blackjack","games",p=>start21Game(p,true)], ["moneyz:test_luck","Test Your Luck","games",p=>testYourLuck(p,true)], ["moneyz:craps","Dice / Craps","games",p=>startCrapsGame(p,true)], ["moneyz:slots","Slots","games",p=>startSlotsGame(p,true)],
  ["moneyz:admin","Moneyz Admin","administration",p=>moneyzAdmin(p),admin], ["moneyz:admin/balances","Balance Manager","administration",p=>balanceManage(p),admin], ["moneyz:admin/tags","Tag Manager","administration",p=>tagManage(p),admin], ["moneyz:admin/shops","Shop Manager","administration",p=>showShopEditorMenu(p),admin], ["moneyz:admin/npcs","NPC Manager","administration",p=>npcManager(p),admin], ["moneyz:admin/settings","Settings","administration",p=>moneyzSettings(p),admin], ["moneyz:admin/properties","Properties","administration",p=>propertiesMenu(p),admin], ["moneyz:admin/transactions","Transaction Ledger","administration",p=>transactionView(p),admin], ["moneyz:admin/diagnostics","Diagnostics","administration",p=>diagnosticsView(p),admin], ["moneyz:admin/jobs","Job Manager","administration",p=>jobAdmin(p),admin], ["moneyz:admin/properties2","Property Manager","administration",p=>propertyAdmin(p),admin], ["moneyz:admin/exchanges","Exchange Manager","administration",p=>exchangeAdmin(p),admin], ["moneyz:admin/products","Product Manager","administration",p=>productAdmin(p),admin], ["moneyz:admin/setup","Setup Wizard","administration",p=>setupWizard(p),admin]
 ];
 for(const [id,label,category,open,canOpen] of defs){Services.register({id,label,category,open,canOpen});NpcMenus.registerMenu(id,(p,c)=>Services.open(id,p,c),{label});}
 Services.register({id:"moneyz:shop",label:"Specific Shop",category:"economy",open:(p,c)=>{const id=c.shopId??c.args?.shopId;if(!id){p.sendMessage("§cNo shop ID was supplied.");return;}return openShop(p,id,{isNpcInteraction:!!c.isNpcInteraction,source:c.source??"service"});}});
}
registerBuiltInNpcMenus();
world.beforeEvents.playerInteractWithEntity.subscribe(data=>{const player=data.player,target=data.target;if(!player||target?.typeId!=="minecraft:npc")return;const services=NpcServices.list(target).map(NpcServices.resolve).filter(Boolean);if(services.length){data.cancel=true;system.run(()=>{const open=s=>NpcServices.open(player,target,s);if(services.length===1){open(services[0]);return;}const chooser=new CustomForm(player,target.nameTag||"Moneyz Services");chooser.header("Choose a Service");for(const s of services)chooser.button(s.label,()=>{try{if(chooser.isShowing())chooser.close();}catch{}system.run(()=>open(s));});chooser.closeButton().show();});return;}if(NpcShops.assigned(target)){data.cancel=true;system.run(()=>Services.open("moneyz:shop",player,{shopId:NpcShops.assigned(target),isNpcInteraction:true,npc:target}));return;}if(NpcMenus.assigned(target)){data.cancel=true;system.run(()=>{if(!NpcMenus.dispatch(player,target))player.sendMessage("§cThis NPC references an unavailable Moneyz service.");});return;}
 const legacy=[["customShop","Custom Shop",()=>customShop(player,true)],["npcRewards","Daily Rewards",()=>openRewardsMenu(player,true)],["npcLuckyP","Lucky Purchase",()=>luckyPurchase(player,true)],["npc21","21",()=>start21Game(player,true)],["npcTestLuck","Test Luck",()=>testYourLuck(player,true)],["npcDice","Dice",()=>startCrapsGame(player,true)],["npcSlots","Slots",()=>startSlotsGame(player,true)],["npcQuest","Quest Giver",()=>giveQuest(player,true)]];const name=target.nameTag||"";for(const [key,fallback,open] of legacy){if(name===Config.get(key,fallback)){data.cancel=true;system.run(open);return;}}
});
log("npcInteract.js initialized",LOG_LEVELS.DEBUG);
