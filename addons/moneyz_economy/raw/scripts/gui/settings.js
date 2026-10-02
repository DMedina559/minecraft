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
    const featureObs=Object.fromEntries(FEATURES.map(k=>[k,new ObservableBoolean(Config.bool(k,true),{clientWritable:true})]));
    const form=new CustomForm(player,"§l§1Moneyz Settings").header("§lGlobal Configuration")
      .toggle("Sync feature flags to players",sync).toggle("One Lucky Purchase per day",once).divider();
    for(const k of FEATURES) form.toggle(k,featureObs[k]);
    form.divider().textField("Daily Reward",daily).textField("Chance Multiplier",chanceX).textField("Win Chance %",chanceWin)
      .textField("Custom Shop Name",shopName).button("§aSave",()=>{
        Config.set("syncPlayers",sync.getData()); Config.set("oneLuckyPurchase",once.getData());
        for(const k of FEATURES) Config.set(k,featureObs[k].getData());
        Config.set("dailyReward",Number(daily.getData())||0); Config.set("chanceX",Number(chanceX.getData())||1); Config.set("chanceWin",Number(chanceWin.getData())||0);
        Config.set("customShop",shopName.getData().trim()||"Custom Shop"); setLogLevelFromWorldProperty(); player.sendMessage("§aMoneyz settings saved.");
      }).button("§cBack",()=>moneyzAdmin(player)).closeButton();
    form.show();
}
