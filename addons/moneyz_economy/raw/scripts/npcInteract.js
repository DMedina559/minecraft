import { openPets } from "./gui/pets.js";
import * as NpcNames from "./api/npc_names.js";
import * as Shops from "./repositories/shops.js";
import { withRoute } from "./ui/navigation.js";
import * as Feedback from "./core/feedback.js";
import { openShortcuts, openSoundSettings } from "./gui/shortcuts.js";
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
import { npcManager, editNpc } from "./gui/npc_manager.js";
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
  ["moneyz:menu","Moneyz Menu","general",p=>main(p)], ["moneyz:shortcuts","My Shortcuts","general",p=>openShortcuts(p)], ["moneyz:audio","Sound Settings","general",p=>openSoundSettings(p)], ["moneyz:help","Help","general",p=>openHelp(p)], ["moneyz:shops","All Shops","economy",p=>openAllShops(p)],
  ["moneyz:atm","ATM / Exchange","economy",p=>openExchange(p),p=>Config.bool("moneyzATM",true,p)], ["moneyz:jobs","Jobs / Employment","roleplay",p=>openJobs(p)], ["moneyz:payroll","Worker Payroll","roleplay",p=>openPayroll(p),p=>Jobs.canRunPayroll(p)], ["moneyz:realtor","Real Estate","roleplay",(p,c)=>openProperties(p,{...c.args,...c})], ["moneyz:hotel","Hotel Services","roleplay",(p,c)=>openHotel(p,{...c.args,...c})], ["moneyz:pets","Pet Shop","economy",(p,c)=>openPets(p,{source:c.source??"service",isNpcInteraction:c.npcInteract})], ["moneyz:products","Products & Services","economy",p=>openProducts(p)], ["moneyz:send","Send Moneyz","economy",(p,c)=>openSendMoney(p,c.npcInteract),p=>Config.bool("moneyzSend",true,p)],
  ["moneyz:custom_shop","Legacy Shop (compatibility)","compatibility",(p,c)=>customShop(p,c.npcInteract)], ["moneyz:daily_rewards","Daily Rewards","rewards",(p,c)=>openRewardsMenu(p,c.npcInteract),p=>Config.bool("moneyzDaily",true,p)], ["moneyz:quests","Quests","rewards",(p,c)=>giveQuest(p,c.npcInteract),p=>Config.bool("moneyzQuest",true,p)],
  ["moneyz:lucky","Feeling Lucky","games",p=>luckyMenu(p),p=>Config.bool("moneyzLucky",true,p)||Config.bool("moneyzChance",true,p)], ["moneyz:lucky_purchase","Lucky Purchase","games",(p,c)=>luckyPurchase(p,c.npcInteract)], ["moneyz:blackjack","21 / Blackjack","games",(p,c)=>start21Game(p,c.npcInteract)], ["moneyz:test_luck","Test Your Luck","games",(p,c)=>testYourLuck(p,c.npcInteract)], ["moneyz:craps","Dice / Craps","games",(p,c)=>startCrapsGame(p,c.npcInteract)], ["moneyz:slots","Slots","games",(p,c)=>startSlotsGame(p,c.npcInteract)],
  ["moneyz:admin","Moneyz Admin","administration",p=>moneyzAdmin(p),admin], ["moneyz:admin/balances","Balance Manager","administration",p=>balanceManage(p),admin], ["moneyz:admin/tags","Tag Manager","administration",p=>tagManage(p),admin], ["moneyz:admin/shops","Shop Manager","administration",p=>showShopEditorMenu(p),admin], ["moneyz:admin/npcs","NPC Manager","administration",(p,c)=>npcManager(p,c.args??c),admin], ["moneyz:admin/settings","Settings","administration",p=>moneyzSettings(p),admin], ["moneyz:admin/properties","Properties","administration",p=>propertiesMenu(p),admin], ["moneyz:admin/transactions","Transaction Ledger","administration",p=>transactionView(p),admin], ["moneyz:admin/diagnostics","Diagnostics","administration",p=>diagnosticsView(p),admin], ["moneyz:admin/jobs","Job Manager","administration",p=>jobAdmin(p),admin], ["moneyz:admin/properties2","Property Manager","administration",p=>propertyAdmin(p),admin], ["moneyz:admin/exchanges","Exchange Manager","administration",p=>exchangeAdmin(p),admin], ["moneyz:admin/products","Product Manager","administration",p=>productAdmin(p),admin], ["moneyz:admin/setup","Setup Wizard","administration",p=>setupWizard(p),admin]
 ];
 for(const [id,label,category,open,canOpen] of defs){Services.register({id,label,category,open,canOpen,adminOnly:category==="administration"});NpcMenus.registerMenu(id,(p,c)=>Services.open(id,p,c),{label,adminOnly:category==="administration",canOpen});}
 Services.register({id:"moneyz:shop",label:"Specific Shop",category:"economy",canOpen:(p,c)=>{const shop=Shops.getShop(c.shopId??c.args?.shopId);return !!shop&&(!shop.settings?.permission||Permissions.has(p,shop.settings.permission));},open:(p,c)=>{const id=c.shopId??c.args?.shopId;if(!id){Feedback.message(p,"§cNo shop ID was supplied.");return;}return openShop(p,id,{isNpcInteraction:!!c.isNpcInteraction,source:c.source??"service"});}});
}
registerBuiltInNpcMenus();
world.beforeEvents.playerInteractWithEntity.subscribe(data=>{const player=data.player,target=data.target;if(!player||target?.typeId!=="minecraft:npc")return;if(player.isSneaking&&Permissions.has(player,"moneyz.admin")){data.cancel=true;system.run(()=>withRoute({type:"service",id:"moneyz:admin/npcs",context:{npcInteract:true,npc:target}},()=>editNpc(player,target)));return;}const bindings=NpcServices.list(target);const services=bindings.map(NpcServices.resolve).filter(s=>s&&NpcServices.canOpen(player,target,s).ok);if(bindings.length){data.cancel=true;system.run(()=>{if(!services.length){Feedback.message(player,"§cNo NPC services are available with your permissions.");return;}const open=s=>NpcServices.open(player,target,s);if(services.length===1){open(services[0]);return;}const chooser=new CustomForm(player,NpcNames.getName(target)).npcContext(true);chooser.header("Choose a Service");for(const s of services)chooser.button(s.label,()=>{try{if(chooser.isShowing())chooser.close();}catch{}system.run(()=>open(s));});chooser.closeButton().show();});return;}if(NpcShops.assigned(target)){data.cancel=true;system.run(()=>Services.open("moneyz:shop",player,{shopId:NpcShops.assigned(target),isNpcInteraction:true,npc:target}));return;}if(NpcMenus.assigned(target)){data.cancel=true;system.run(()=>{if(!NpcMenus.dispatch(player,target))Feedback.message(player,"§cThis NPC references an unavailable Moneyz service.");});return;}
 const legacy=[["customShop","Custom Shop",()=>customShop(player,true)],["npcRewards","Daily Rewards",()=>openRewardsMenu(player,true)],["npcLuckyP","Lucky Purchase",()=>luckyPurchase(player,true)],["npc21","21",()=>start21Game(player,true)],["npcTestLuck","Test Luck",()=>testYourLuck(player,true)],["npcDice","Dice",()=>startCrapsGame(player,true)],["npcSlots","Slots",()=>startSlotsGame(player,true)],["npcQuest","Quest Giver",()=>giveQuest(player,true)]];const name=NpcNames.getName(target);for(const [key,fallback,open] of legacy){if(name===Config.get(key,fallback)){data.cancel=true;system.run(()=>withRoute({type:"npcLegacy",context:{npcInteract:true},args:{npcInteract:true}},open));return;}}
});
log("npcInteract.js initialized",LOG_LEVELS.DEBUG);
