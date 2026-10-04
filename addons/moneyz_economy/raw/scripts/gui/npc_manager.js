import { system } from "@minecraft/server";
import { CustomForm, ObservableNumber, ObservableString } from "../ui/ddui.js";
import * as Services from "../api/services.js";
import * as NpcServices from "../api/npc_services.js";
import * as Shops from "../repositories/shops.js";
import { moneyzAdmin } from "./admin_menu.js";

const nav=(form,fn)=>{try{if(form.isShowing())form.close();}catch{}system.run(fn);};
const npcLabel=n=>n?.nameTag?.trim()||"Unnamed NPC";
function nearby(player){return [...player.dimension.getEntities({type:"minecraft:npc",location:player.location,maxDistance:12})].sort((a,b)=>{const d=x=>(x.location.x-player.location.x)**2+(x.location.y-player.location.y)**2+(x.location.z-player.location.z)**2;return d(a)-d(b);});}
export function npcManager(player){
 const npcs=nearby(player),form=new CustomForm(player,"§l§1NPC Manager");
 form.label(`§7Choose a nearby NPC to manage its shops and services.\n§f${npcs.length} NPC(s) within 12 blocks.`);
 if(npcs.length) form.button("Select Nearby NPC",()=>nav(form,()=>selectNpc(player,npcs)));
 form.button("Back",()=>nav(form,()=>moneyzAdmin(player))).closeButton().show();
}
function selectNpc(player,npcs=nearby(player)){
 if(!npcs.length)return npcManager(player);
 const pick=new ObservableNumber(0,{clientWritable:true}),form=new CustomForm(player,"Select NPC");
 form.dropdown("Nearby NPC",pick,npcs.map((n,i)=>({label:`${npcLabel(n)} • ${Math.round(Math.hypot(n.location.x-player.location.x,n.location.y-player.location.y,n.location.z-player.location.z))}m`,value:i})))
 .button("Configure",()=>{const npc=npcs[pick.getData()];if(npc)nav(form,()=>editNpc(player,npc));})
 .button("Back",()=>nav(form,()=>npcManager(player))).closeButton().show();
}
function editNpc(player,npc){
 const services=NpcServices.list(npc).map(NpcServices.resolve).filter(Boolean),form=new CustomForm(player,"NPC Services");
 form.header(npcLabel(npc)).label(`§7${services.length?services.map((s,i)=>`${i+1}. ${s.label} (${s.type}: ${s.id})`).join("\n"):"No Moneyz services assigned."}`)
 .button("Add Specific Shop",()=>nav(form,()=>addShop(player,npc)))
 .button("Add Moneyz Service",()=>nav(form,()=>addMenu(player,npc)));
 if(services.length) form.button("Remove Service",()=>nav(form,()=>removeService(player,npc))).button("Clear All Services",()=>{NpcServices.clear(npc);player.sendMessage("§eMoneyz services cleared from NPC.");nav(form,()=>editNpc(player,npc));});
 form.button("Back",()=>nav(form,()=>selectNpc(player))).closeButton().show();
}
function addShop(player,npc){
 const ids=Object.keys(Shops.getShopData()).filter(id=>Shops.getShop(id)?.settings?.allowNpcBinding!==false);if(!ids.length)return editNpc(player,npc);
 const pick=new ObservableNumber(0,{clientWritable:true}),label=new ObservableString("",{clientWritable:true}),form=new CustomForm(player,"Add Shop Service");
 form.dropdown("Shop ID",pick,ids.map((id,i)=>({label:`${Shops.getShop(id)?.name??id} • ${id}`,value:i}))).textField("Button label (optional)",label,{description:"Leave blank to use the shop name."})
 .button("Add",()=>{const id=ids[pick.getData()];const r=NpcServices.add(npc,{type:"shop",id,label:label.getData().trim()});player.sendMessage(r.ok?`§aAdded shop ${id}.`:`§cCould not add shop.`);nav(form,()=>editNpc(player,npc));})
 .button("Back",()=>nav(form,()=>editNpc(player,npc))).closeButton().show();
}
function addMenu(player,npc){
 const services=Services.list().filter(s=>s.id!=="moneyz:shop");if(!services.length)return editNpc(player,npc);
 const pick=new ObservableNumber(0,{clientWritable:true}),label=new ObservableString("",{clientWritable:true}),form=new CustomForm(player,"Add Moneyz Service");
 form.dropdown("Service",pick,services.map((m,i)=>({label:`${m.label} • ${m.category} • ${m.id}`,value:i}))).textField("Button label (optional)",label,{description:"Leave blank to use the registered service label."})
 .button("Add",()=>{const m=services[pick.getData()];const r=NpcServices.add(npc,{type:"service",id:m.id,label:label.getData().trim()});player.sendMessage(r.ok?`§aAdded ${m.label}.`:`§cCould not add service.`);nav(form,()=>editNpc(player,npc));})
 .button("Back",()=>nav(form,()=>editNpc(player,npc))).closeButton().show();
}
function removeService(player,npc){
 const services=NpcServices.list(npc).map(NpcServices.resolve).filter(Boolean);if(!services.length)return editNpc(player,npc);
 const pick=new ObservableNumber(0,{clientWritable:true}),form=new CustomForm(player,"Remove Service");
 form.dropdown("Service",pick,services.map((s,i)=>({label:`${s.label} • ${s.type}:${s.id}`,value:i}))).button("Remove",()=>{NpcServices.remove(npc,pick.getData());player.sendMessage("§eService removed.");nav(form,()=>editNpc(player,npc));}).button("Back",()=>nav(form,()=>editNpc(player,npc))).closeButton().show();
}
