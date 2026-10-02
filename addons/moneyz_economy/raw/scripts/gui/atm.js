import { system } from "@minecraft/server";
import { CustomForm, ObservableNumber } from "@minecraft/server-ui";
import * as Economy from "../core/economy.js";
import * as Inventory from "../services/inventory.js";
const nav=(form,fn)=>{try{if(form.isShowing())form.close();}catch{}system.run(fn);};
export const ATM_RATES=Object.freeze([
 {id:"minecraft:coal",name:"Coal",amount:16,moneyz:12},
 {id:"minecraft:copper_ingot",name:"Copper Ingots",amount:8,moneyz:18},
 {id:"minecraft:iron_ingot",name:"Iron Ingots",amount:4,moneyz:30},
 {id:"minecraft:gold_ingot",name:"Gold Ingots",amount:4,moneyz:45},
 {id:"minecraft:redstone",name:"Redstone",amount:16,moneyz:25},
 {id:"minecraft:lapis_lazuli",name:"Lapis Lazuli",amount:8,moneyz:35},
 {id:"minecraft:emerald",name:"Emerald",amount:1,moneyz:45},
 {id:"minecraft:diamond",name:"Diamond",amount:1,moneyz:175}
]);
export function openAtm(player){if(!player)return;const pick=new ObservableNumber(0,{clientWritable:true}),form=new CustomForm(player,"§l§1Moneyz ATM");form.header("Resource Exchange").label(`§6Balance: §g${Economy.getBalance(player)} Moneyz\n§7Exchange resources without legacy NPC dialogue/functions.`).dropdown("Resource",pick,ATM_RATES.map((r,i)=>({label:`${r.name} • ${r.amount} ↔ ${r.moneyz} Moneyz`,value:i}))).button("Exchange Resources → Moneyz",()=>nav(form,()=>exchange(player,ATM_RATES[pick.getData()],"sell"))).button("Exchange Moneyz → Resources",()=>nav(form,()=>exchange(player,ATM_RATES[pick.getData()],"buy"))).closeButton().show();}
function exchange(player,rate,direction){if(!rate)return openAtm(player);const max=direction==="sell"?Math.max(1,Math.min(64,Math.floor(Inventory.count(player,rate.id)/rate.amount)||1)):Math.max(1,Math.min(64,Math.floor(Economy.getBalance(player)/rate.moneyz)||1));const qty=new ObservableNumber(1,{clientWritable:true}),form=new CustomForm(player,`${rate.name} Exchange`);form.label(`${rate.amount} ${rate.name} = ${rate.moneyz} Moneyz\n§6Balance: §g${Economy.getBalance(player)}\n§fInventory: ${Inventory.count(player,rate.id)}`).slider("Bundles",qty,1,max,{step:1}).button(direction==="sell"?"Convert to Moneyz":"Buy Resources",async()=>{const n=Math.max(1,Math.round(qty.getData())),items=rate.amount*n,money=rate.moneyz*n;if(direction==="sell"){if(Inventory.count(player,rate.id)<items){player.sendMessage("§cNot enough resources.");return;}if(!await Inventory.remove(player,rate.id,items)){player.sendMessage("§cCould not remove resources.");return;}if(!Economy.deposit(player,money,{type:"atm_exchange",source:"moneyz:atm",resource:rate.id})){await Inventory.give(player,rate.id,items);player.sendMessage("§cExchange failed; resources refunded.");return;}player.sendMessage(`§aExchanged ${items} ${rate.name} for ${money} Moneyz.`);}else{if(!Economy.withdraw(player,money,{type:"atm_exchange",source:"moneyz:atm",resource:rate.id})){player.sendMessage("§cNot enough Moneyz.");return;}if(!await Inventory.give(player,rate.id,items)){Economy.deposit(player,money,{type:"atm_refund",source:"moneyz:atm"});player.sendMessage("§cCould not deliver resources; Moneyz refunded.");return;}player.sendMessage(`§aBought ${items} ${rate.name} for ${money} Moneyz.`);}}).button("Back",()=>nav(form,()=>openAtm(player))).closeButton().show();}
