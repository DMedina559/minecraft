import { world, system } from "@minecraft/server";
import { CustomForm, ObservableNumber, ObservableString } from "@minecraft/server-ui";
import * as Economy from "../core/economy.js";
import * as Treasury from "../core/treasury.js";
import { recent, clear as clearTransactions } from "../core/transactions.js";
import { formatHealth } from "../core/health.js";
import { main } from "./moneyz_menu.js";
import { propertiesMenu } from "./properties_menu.js";
import { moneyzSettings } from "./settings.js";
import { showShopEditorMenu } from "./shop_editor.js";
import { npcManager } from "./npc_manager.js";
import { jobAdmin } from "./jobs.js";
import { propertyAdmin } from "./properties.js";
import { exchangeAdmin } from "./exchanges.js";
import { productAdmin } from "./products.js";
import { setupWizard } from "./setup_wizard.js";
import { log, LOG_LEVELS } from "../logger.js";

const TITLE="§l§1Admin Menu";
export function moneyzAdmin(player) {
    if(!player) return;
    const form = new CustomForm(player, TITLE);
    const navigate = (next) => {
        try { if (form.isShowing()) form.close(); } catch {}
        system.run(next);
    };
    form.header("§l§o§fManage Moneyz").divider()
      .button("Manage Balances",()=>navigate(()=>balanceManage(player)))
      .button("Economy Treasury",()=>navigate(()=>treasuryManage(player)))
      .button("Manage Properties",()=>navigate(()=>propertiesMenu(player)))
      .button("Manage Tags",()=>navigate(()=>tagManage(player)))
      .button("Manage Shops",()=>navigate(()=>showShopEditorMenu(player)))
      .button("Manage NPC Services",()=>navigate(()=>npcManager(player)))
      .button("Manage Jobs",()=>navigate(()=>jobAdmin(player)))
      .button("Manage Properties / Hotels",()=>navigate(()=>propertyAdmin(player)))
      .button("Manage Exchanges",()=>navigate(()=>exchangeAdmin(player)))
      .button("Manage Products / Bundles",()=>navigate(()=>productAdmin(player)))
      .button("Setup Wizard",()=>navigate(()=>setupWizard(player)))
      .button("Settings",()=>navigate(()=>moneyzSettings(player)))
      .button("Recent Transactions",()=>navigate(()=>transactionView(player)))
      .button("Diagnostics",()=>navigate(()=>diagnosticsView(player)))
      .button("Back",()=>navigate(()=>main(player))).closeButton();
    form.show().catch(e=>log(`Admin UI: ${e}`,LOG_LEVELS.ERROR));
}

export function balanceManage(admin) {
    const players=[...world.getPlayers()]; if(!players.length) return;
    const selected=new ObservableNumber(0,{clientWritable:true});
    const amount=new ObservableString("0",{clientWritable:true});
    const balanceLabel=new ObservableString("");
    const refresh=()=>{ const p=players[selected.getData()]; balanceLabel.setData(p?`§f${p.nameTag}: §g${Economy.getBalance(p)} Moneyz`:"No player"); };
    selected.subscribe(refresh); refresh();
    const act=op=>{ const p=players[selected.getData()], n=Math.round(Number(amount.getData())); if(!p||!Number.isFinite(n)||n<0){admin.sendMessage("§cEnter a valid non-negative amount.");return;} const ok=Economy[op](p,n,{source:"admin_ui",actor:admin}); if(!ok) admin.sendMessage("§cOperation failed."); else {try{admin.playSound("random.levelup");}catch{} refresh();} };
    const form = new CustomForm(admin,"§l§1Balance Manager");
    const back = () => { try { if (form.isShowing()) form.close(); } catch {} system.run(()=>moneyzAdmin(admin)); };
    form.label(balanceLabel).dropdown("Player",selected,players.map((p,i)=>({label:p.nameTag,value:i})))
      .textField("Amount",amount,{description:"Whole Moneyz amount"}).button("Add",()=>act("deposit")).button("Set",()=>act("setBalance"))
      .button("Remove",()=>act("withdraw")).button("Back",back).closeButton().show().catch(e=>log(`Balance UI: ${e}`,LOG_LEVELS.ERROR));
}
export function transactionView(player){
    const types=["all",...new Set(recent(150).map(t=>t.type))], filter=new ObservableNumber(0,{clientWritable:true}), query=new ObservableString("",{clientWritable:true}), body=new ObservableString("");
    const refresh=()=>{const q=query.getData().trim().toLowerCase(),type=types[filter.getData()]??"all";const rows=recent(150).filter(t=>(type==="all"||t.type===type)&&(!q||JSON.stringify(t).toLowerCase().includes(q))).slice(0,40);body.setData(rows.map(t=>`§7${new Date(t.at).toISOString().slice(0,19)} §f${t.type} §g${t.amount} §8${t.from??""}${t.to?` -> ${t.to}`:""} §7#${t.id}`).join("\n")||"No matching transactions.");};
    filter.subscribe(refresh);query.subscribe(refresh);refresh();
    const form = new CustomForm(player,"§l§1Transaction Ledger");
    const back = () => { try { if (form.isShowing()) form.close(); } catch {} system.run(()=>moneyzAdmin(player)); };
    form.dropdown("Type",filter,types.map((x,i)=>({label:x,value:i}))).textField("Search player/id/metadata",query).label(body).button("Refresh",refresh).button("Clear Ledger",()=>{clearTransactions();refresh();player.sendMessage("§eMoneyz transaction ledger cleared.");}).button("Back",back).closeButton().show();
}
export function diagnosticsView(player){
    const form = new CustomForm(player,"§l§1Moneyz Diagnostics");
    const navigate = next => { try { if (form.isShowing()) form.close(); } catch {} system.run(next); };
    form.label(formatHealth()).button("Refresh",()=>navigate(()=>diagnosticsView(player))).button("Back",()=>navigate(()=>moneyzAdmin(player))).closeButton().show();
}
export function tagManage(admin){
    const players=[...world.getPlayers()]; if(!players.length)return;
    const selected=new ObservableNumber(0,{clientWritable:true}), tag=new ObservableString("",{clientWritable:true}), status=new ObservableString("");
    const refresh=()=>{const p=players[selected.getData()];status.setData(p?`§fTags: §g${p.getTags().join(", ")||"None"}`:"");}; selected.subscribe(refresh);refresh();
    const apply=add=>{const p=players[selected.getData()],v=tag.getData().trim();if(!p||!v)return; if(add)p.addTag(v);else p.removeTag(v);refresh();};
    const form = new CustomForm(admin,"§l§1Tag Manager");
    form.label(status).dropdown("Player",selected,players.map((p,i)=>({label:p.nameTag,value:i}))).textField("Tag",tag)
      .button("Add Tag",()=>apply(true)).button("Remove Tag",()=>apply(false)).button("Back",()=>{ try { if (form.isShowing()) form.close(); } catch {} system.run(()=>moneyzAdmin(admin)); }).closeButton().show();
}
log("admin_menu.js loaded",LOG_LEVELS.DEBUG);

export function treasuryManage(admin){
 const amount=new ObservableString("0",{clientWritable:true}),status=new ObservableString("");
 const refresh=()=>{const s=Treasury.stats();status.setData(`§lMode:§r §e${s.mode}\n§lLiquid Treasury:§r §g${s.balance} Moneyz\n§lResource Reserve Value:§r §b${s.reserveValue}\n§lTotal Backing:§r §a${s.totalBacking}\n§7Inflow ${s.inflow} • Outflow ${s.outflow} • Issued ${s.issued}`);};refresh();
 const value=()=>Math.max(0,Math.round(Number(amount.getData())||0));
 const form=new CustomForm(admin,"§l§1Economy Treasury");
 const back=()=>{try{if(form.isShowing())form.close();}catch{}system.run(()=>moneyzAdmin(admin));};
 form.label(status).textField("Amount",amount,{description:"Whole Moneyz amount"})
 .button("Add Treasury Funds",()=>{Treasury.deposit(value(),{reason:"admin_deposit"});refresh();})
 .button("Remove Treasury Funds",()=>{const r=Treasury.withdraw(value(),{reason:"admin_withdraw"});if(!r.ok)admin.sendMessage("§cTreasury does not have enough Moneyz.");refresh();})
 .divider().button("Mode: Classic (Unlimited)",()=>{Treasury.setMode("classic");refresh();})
 .button("Mode: Treasury",()=>{Treasury.setMode("treasury");refresh();})
 .button("Mode: Reserve Economy",()=>{Treasury.setMode("reserve");refresh();})
 .button("View Resource Reserves",()=>{admin.sendMessage(Treasury.listReserves().map(r=>`§f${r.itemId}: §e${r.count} §7(value ${r.value})`).join("\n")||"§7No resource reserves recorded.");})
 .button("Back",back).closeButton().show().catch(e=>log(`Treasury UI: ${e}`,LOG_LEVELS.ERROR));
}
