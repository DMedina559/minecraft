import { world } from "@minecraft/server";
import { CustomForm, ObservableNumber, ObservableString } from "@minecraft/server-ui";
import * as Economy from "../core/economy.js";
import { recent } from "../core/transactions.js";
import { main } from "./moneyz_menu.js";
import { propertiesMenu } from "./properties_menu.js";
import { moneyzSettings } from "./settings.js";
import { showShopEditorMenu } from "./shop_editor.js";
import { log, LOG_LEVELS } from "../logger.js";

const TITLE="§l§1Admin Menu";
export function moneyzAdmin(player) {
    if(!player) return;
    const form=new CustomForm(player,TITLE).header("§l§o§fManage Moneyz").divider()
      .button("§d§lManage Balances",()=>balanceManage(player))
      .button("§d§lManage Properties",()=>propertiesMenu(player))
      .button("§d§lManage Tags",()=>tagManage(player))
      .button("§d§lManage Shops",()=>showShopEditorMenu(player))
      .button("§d§lSettings",()=>moneyzSettings(player))
      .button("§d§lRecent Transactions",()=>transactionView(player))
      .button("§c§lBack",()=>main(player)).closeButton();
    form.show().catch(e=>log(`Admin UI: ${e}`,LOG_LEVELS.ERROR));
}
function balanceManage(admin) {
    const players=[...world.getPlayers()]; if(!players.length) return;
    const selected=new ObservableNumber(0,{clientWritable:true});
    const amount=new ObservableString("0",{clientWritable:true});
    const balanceLabel=new ObservableString("");
    const refresh=()=>{ const p=players[selected.getData()]; balanceLabel.setData(p?`§f${p.nameTag}: §g${Economy.getBalance(p)} Moneyz`:"No player"); };
    selected.subscribe(refresh); refresh();
    const act=op=>{ const p=players[selected.getData()], n=Math.round(Number(amount.getData())); if(!p||!Number.isFinite(n)||n<0){admin.sendMessage("§cEnter a valid non-negative amount.");return;} const ok=Economy[op](p,n,{source:"admin_ui",actor:admin}); if(!ok) admin.sendMessage("§cOperation failed."); else {try{admin.playSound("random.levelup");}catch{} refresh();} };
    new CustomForm(admin,"§l§1Balance Manager").label(balanceLabel).dropdown("Player",selected,players.map((p,i)=>({label:p.nameTag,value:i})))
      .textField("Amount",amount,{description:"Whole Moneyz amount"}).button("§aAdd",()=>act("deposit")).button("§eSet",()=>act("setBalance"))
      .button("§cRemove",()=>act("withdraw")).button("§7Back",()=>moneyzAdmin(admin)).closeButton().show().catch(e=>log(`Balance UI: ${e}`,LOG_LEVELS.ERROR));
}
function transactionView(player){ const lines=recent(30).map(t=>`§7${new Date(t.at).toISOString()} §f${t.type} §g${t.amount} §8${t.from??""}${t.to?` -> ${t.to}`:""}`); new CustomForm(player,"§l§1Transactions").label(lines.join("\n")||"No transactions yet.").button("§cBack",()=>moneyzAdmin(player)).closeButton().show(); }
function tagManage(admin){
    const players=[...world.getPlayers()]; if(!players.length)return;
    const selected=new ObservableNumber(0,{clientWritable:true}), tag=new ObservableString("",{clientWritable:true}), status=new ObservableString("");
    const refresh=()=>{const p=players[selected.getData()];status.setData(p?`§fTags: §g${p.getTags().join(", ")||"None"}`:"");}; selected.subscribe(refresh);refresh();
    const apply=add=>{const p=players[selected.getData()],v=tag.getData().trim();if(!p||!v)return; if(add)p.addTag(v);else p.removeTag(v);refresh();};
    new CustomForm(admin,"§l§1Tag Manager").label(status).dropdown("Player",selected,players.map((p,i)=>({label:p.nameTag,value:i}))).textField("Tag",tag)
      .button("§aAdd Tag",()=>apply(true)).button("§cRemove Tag",()=>apply(false)).button("§7Back",()=>moneyzAdmin(admin)).closeButton().show();
}
log("admin_menu.js loaded",LOG_LEVELS.DEBUG);
