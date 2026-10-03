import { system } from "@minecraft/server";
import { CustomForm, ObservableBoolean, ObservableNumber, ObservableString } from "@minecraft/server-ui";
import * as Config from "../core/config.js";
import { setLogLevelFromWorldProperty } from "../logger.js";
import { moneyzAdmin } from "./admin_menu.js";

const FEATURES=["moneyzATM","moneyzQuest","moneyzSend","moneyzShop","moneyzDaily","moneyzLucky","moneyzChance"];
export function moneyzSettings(player){
    const sync=new ObservableBoolean(Config.bool("syncPlayers",true),{clientWritable:true});
    const once=new ObservableBoolean(Config.bool("oneLuckyPurchase",true),{clientWritable:true});
    const daily=new ObservableString(String(Config.number("dailyReward",25)),{clientWritable:true});
    const chanceX=new ObservableString(String(Config.number("chanceX",2)),{clientWritable:true});
    const chanceWin=new ObservableString(String(Config.number("chanceWin",50)),{clientWritable:true});
    const shopName=new ObservableString(String(Config.get("customShop","Custom Shop")),{clientWritable:true});
    const luckyPrice=new ObservableString(String(Config.number("luckyPurchasePrice",150)),{clientWritable:true});
    const luckyStock=new ObservableBoolean(Config.bool("luckyUseShopStock",true),{clientWritable:true});
    const luckyShops=new ObservableString(String(Config.get("luckyShops","")),{clientWritable:true});
    const luckyCategories=new ObservableString(String(Config.get("luckyCategories","")),{clientWritable:true});
    const featureObs=Object.fromEntries(FEATURES.map(k=>[k,new ObservableBoolean(Config.bool(k,true),{clientWritable:true})]));
    const form=new CustomForm(player,"§l§1Moneyz Settings").header("§lGlobal Configuration")
      .toggle("Sync feature flags to players",sync).toggle("One Lucky Purchase per day",once).divider();
    for(const k of FEATURES) form.toggle(k,featureObs[k]);
    form.divider().textField("Daily Reward",daily).textField("Chance Multiplier",chanceX).textField("Test Your Luck Win Chance %",chanceWin)
      .textField("Custom Shop Name",shopName).divider().header("§lLucky Purchase").textField("Lucky Purchase Price",luckyPrice).toggle("Use live Shop stock",luckyStock).textField("Eligible Shop IDs (comma separated; blank = all)",luckyShops).textField("Eligible Categories (comma separated; blank = all)",luckyCategories).button("Save",()=>{
        Config.set("syncPlayers",sync.getData()); Config.set("oneLuckyPurchase",once.getData());
        for(const k of FEATURES) Config.set(k,featureObs[k].getData());
        Config.set("dailyReward",Number(daily.getData())||0); Config.set("chanceX",Number(chanceX.getData())||1); Config.set("chanceWin",Number(chanceWin.getData())||0);
        Config.set("customShop",shopName.getData().trim()||"Custom Shop"); Config.set("luckyPurchasePrice",Math.max(0,Number(luckyPrice.getData())||0)); Config.set("luckyUseShopStock",luckyStock.getData()); Config.set("luckyShops",luckyShops.getData().trim()); Config.set("luckyCategories",luckyCategories.getData().trim()); setLogLevelFromWorldProperty(); player.sendMessage("§aMoneyz settings saved.");
      }).button("Back",()=>{ try { if (form.isShowing()) form.close(); } catch {} system.run(()=>moneyzAdmin(player)); }).closeButton();
    form.show();
}
