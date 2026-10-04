import { world, system } from "@minecraft/server";
import { CustomForm, ObservableNumber, ObservableString } from "../ui/ddui.js";
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
    form.header("Balances & Economy").divider()
      .button("Manage Balances",()=>navigate(()=>balanceManage(player)))
      .button("Economy Treasury",()=>navigate(()=>treasuryManage(player)))
      .button("Manage Tags",()=>navigate(()=>tagManage(player)))
      .divider().header("Shops & World Services")
      .button("Manage Shops",()=>navigate(()=>showShopEditorMenu(player)))
      .button("Manage NPC Services",()=>navigate(()=>npcManager(player)))
      .button("Manage Jobs",()=>navigate(()=>jobAdmin(player)))
      .button("Manage Properties / Hotels",()=>navigate(()=>propertyAdmin(player)))
      .button("Manage Exchanges",()=>navigate(()=>exchangeAdmin(player)))
      .button("Manage Products / Bundles",()=>navigate(()=>productAdmin(player)))
      .divider().header("Setup & Maintenance")
      .button("World / Player Properties",()=>navigate(()=>propertiesMenu(player)))
      .button("Setup Wizard",()=>navigate(()=>setupWizard(player)))
      .button("Settings",()=>navigate(()=>moneyzSettings(player)))
      .button("Recent Transactions",()=>navigate(()=>transactionView(player)))
      .button("Diagnostics",()=>navigate(()=>diagnosticsView(player)))
      .divider().button("Main Menu",()=>navigate(()=>main(player))).closeButton();
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
 const modes=["classic","treasury","reserve"], modeLabels=["Classic (Unlimited)","Treasury","Reserve Economy"];
 const current=Math.max(0,modes.indexOf(Treasury.getMode()));
 const mode=new ObservableNumber(current,{clientWritable:true}), amount=new ObservableString("0",{clientWritable:true}),status=new ObservableString("");
 const refresh=()=>{const s=Treasury.stats();status.setData(`§lMode:§r §e${modeLabels[modes.indexOf(s.mode)]??s.mode}\n§lLiquid Treasury:§r §g${s.balance} Moneyz\n§lResource Reserve Value:§r §b${s.reserveValue}\n§lTotal Backing:§r §a${s.totalBacking}\n§7Inflow ${s.inflow} • Outflow ${s.outflow} • Issued ${s.issued}`);};refresh();
 mode.subscribe(()=>{const next=modes[mode.getData()]??"classic";if(next!==Treasury.getMode()){Treasury.setMode(next);admin.sendMessage(`§aEconomy mode set to §e${modeLabels[mode.getData()]}.`);}refresh();});
 const value=()=>Math.max(0,Math.round(Number(amount.getData())||0));
 const form=new CustomForm(admin,"§l§1Economy Treasury");
 const navigate=next=>{try{if(form.isShowing())form.close();}catch{}system.run(next);};
 form.label(status)
 .dropdown("Economy Mode",mode,modeLabels.map((label,i)=>({label,value:i})))
 .divider().textField("Treasury Amount",amount,{description:"Whole Moneyz amount"})
 .button("Add Treasury Funds",()=>{Treasury.deposit(value(),{reason:"admin_deposit",metadata:{actor:admin.name}});refresh();})
 .button("Remove Treasury Funds",()=>{const r=Treasury.withdraw(value(),{reason:"admin_withdraw",metadata:{actor:admin.name}});if(!r.ok)admin.sendMessage("§cTreasury does not have enough Moneyz.");refresh();})
 .button("Set Treasury Balance",()=>{Treasury.setBalance(value(),{reason:"admin_set"});refresh();admin.sendMessage(`§aTreasury balance set to §g${Treasury.getBalance()} Moneyz.`);})
 .divider().button("Manage Resource Reserves",()=>navigate(()=>resourceReserves(admin)))
 .button("Back",()=>navigate(()=>moneyzAdmin(admin))).closeButton().show().catch(e=>log(`Treasury UI: ${e}`,LOG_LEVELS.ERROR));
}

export function resourceReserves(admin){
 const reserves=Treasury.listReserves().filter(r=>r.count>0||r.value>0);
 const form=new CustomForm(admin,"§l§1Resource Reserve Manager");
 const navigate=next=>{try{if(form.isShowing())form.close();}catch{}system.run(next);};
 form.header("§lReserve Assets");
 if(!reserves.length) form.label("§7No resource reserves are currently recorded.\n§7Use Add Resource Reserve to create one.");
 else {
   const totalCount=reserves.reduce((n,r)=>n+r.count,0), totalValue=reserves.reduce((n,r)=>n+r.value,0);
   form.label(`§fTracked resources: §e${reserves.length}\n§fTotal units: §e${totalCount}\n§fReserve value: §b${totalValue} Moneyz`).divider();
   for(const r of reserves){
     const unit=r.count>0?(r.value/r.count).toFixed(2):"0.00";
     form.button(`${r.itemId}\n§7${r.count} units • §b${r.value} M`,()=>navigate(()=>editResourceReserve(admin,r.itemId)));
   }
 }
 form.divider().button("Add Resource Reserve",()=>navigate(()=>addResourceReserve(admin)))
   .button("Refresh",()=>navigate(()=>resourceReserves(admin)))
   .button("Back",()=>navigate(()=>treasuryManage(admin))).closeButton().show().catch(e=>log(`Reserve UI: ${e}`,LOG_LEVELS.ERROR));
}

function addResourceReserve(admin){
 const itemId=new ObservableString("minecraft:diamond",{clientWritable:true}), count=new ObservableString("0",{clientWritable:true}), value=new ObservableString("0",{clientWritable:true});
 const form=new CustomForm(admin,"§l§1Add Resource Reserve");
 const navigate=next=>{try{if(form.isShowing())form.close();}catch{}system.run(next);};
 form.textField("Item / Block ID",itemId,{description:"Example: minecraft:diamond or myaddon:resource"})
   .textField("Quantity",count,{description:"Current reserve stock"})
   .textField("Total Reserve Value",value,{description:"Total Moneyz value of this reserve"})
   .button("Create Reserve",()=>{const id=itemId.getData().trim(),c=Math.max(0,Math.round(Number(count.getData())||0)),v=Math.max(0,Math.round(Number(value.getData())||0));if(!id){admin.sendMessage("§cEnter an item/block identifier.");return;}Treasury.setReserve(id,c,v,{reason:"admin_reserve_create",metadata:{actor:admin.name}});admin.sendMessage(`§aCreated reserve §f${id}§a: §e${c} §7units / §b${v} Moneyz.`);navigate(()=>editResourceReserve(admin,id));})
   .button("Back",()=>navigate(()=>resourceReserves(admin))).closeButton().show().catch(e=>log(`Add Reserve UI: ${e}`,LOG_LEVELS.ERROR));
}

function editResourceReserve(admin,itemId){
 const row=Treasury.listReserves().find(r=>r.itemId===itemId)??{itemId,count:0,value:0};
 const qty=new ObservableString("0",{clientWritable:true}), val=new ObservableString("0",{clientWritable:true}), status=new ObservableString("");
 const refresh=()=>{const r=Treasury.listReserves().find(x=>x.itemId===itemId)??{itemId,count:0,value:0};const unit=r.count>0?(r.value/r.count).toFixed(2):"0.00";status.setData(`§f${itemId}\n§lQuantity:§r §e${r.count}\n§lReserve Value:§r §b${r.value} Moneyz\n§lValue / Unit:§r §a${unit} Moneyz`);};refresh();
 const numbers=()=>({q:Math.max(0,Math.round(Number(qty.getData())||0)),v:Math.max(0,Math.round(Number(val.getData())||0))});
 const form=new CustomForm(admin,"§l§1Edit Resource Reserve");
 const navigate=next=>{try{if(form.isShowing())form.close();}catch{}system.run(next);};
 form.label(status).textField("Quantity",qty,{description:"Amount to add/remove, or exact quantity when setting"}).textField("Reserve Value",val,{description:"Moneyz value to add/remove, or exact value when setting"})
   .button("Add Stock / Value",()=>{const {q,v}=numbers(),r=Treasury.listReserves().find(x=>x.itemId===itemId)??{count:0,value:0};Treasury.setReserve(itemId,r.count+q,r.value+v,{reason:"admin_reserve_add",metadata:{actor:admin.name}});refresh();})
   .button("Remove Stock / Value",()=>{const {q,v}=numbers(),r=Treasury.listReserves().find(x=>x.itemId===itemId)??{count:0,value:0};Treasury.setReserve(itemId,Math.max(0,r.count-q),Math.max(0,r.value-v),{reason:"admin_reserve_remove",metadata:{actor:admin.name}});refresh();})
   .button("Set Exact Quantity / Value",()=>{const {q,v}=numbers();Treasury.setReserve(itemId,q,v,{reason:"admin_reserve_set",metadata:{actor:admin.name}});refresh();admin.sendMessage(`§aUpdated reserve §f${itemId}§a.`);})
   .button("Clear Reserve",()=>navigate(()=>confirmClearReserve(admin,itemId)))
   .button("Back",()=>navigate(()=>resourceReserves(admin))).closeButton().show().catch(e=>log(`Edit Reserve UI: ${e}`,LOG_LEVELS.ERROR));
}

function confirmClearReserve(admin,itemId){
 const form=new CustomForm(admin,"§l§cClear Resource Reserve?");
 const navigate=next=>{try{if(form.isShowing())form.close();}catch{}system.run(next);};
 form.label(`§cThis will clear all tracked stock and reserve value for:\n§f${itemId}\n\n§7This does not remove items from player inventories.`)
   .button("Confirm Clear",()=>{Treasury.clearReserve(itemId,{reason:"admin_reserve_clear",metadata:{actor:admin.name}});admin.sendMessage(`§eCleared resource reserve §f${itemId}§e.`);navigate(()=>resourceReserves(admin));})
   .button("Cancel",()=>navigate(()=>editResourceReserve(admin,itemId))).closeButton().show().catch(e=>log(`Clear Reserve UI: ${e}`,LOG_LEVELS.ERROR));
}

