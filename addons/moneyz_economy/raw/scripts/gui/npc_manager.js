import * as NpcNames from "../api/npc_names.js";
import { withRoute } from "../ui/navigation.js";
import { defer } from "../ui/navigation.js";
import * as Feedback from "../core/feedback.js";
import { system } from "@minecraft/server";
import { CustomForm, ObservableNumber, ObservableString, ObservableBoolean } from "../ui/ddui.js";
import * as Services from "../api/services.js";
import * as NpcServices from "../api/npc_services.js";
import * as Shops from "../repositories/shops.js";
import * as Permissions from "../core/permissions.js";
import { moneyzAdmin } from "./admin_menu.js";
const nav=(form,fn)=>{try{if(form.isShowing())form.close();}catch{}defer(()=>withRoute(form._route,fn));};
const npcLabel=n=>NpcNames.getName(n);
const position=n=>`${Math.floor(n.location.x)}, ${Math.floor(n.location.y)}, ${Math.floor(n.location.z)}`;
const pretty=s=>String(s).replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());
const distance=(p,n)=>Math.round(Math.hypot(n.location.x-p.location.x,n.location.y-p.location.y,n.location.z-p.location.z));
const allowed=p=>Permissions.has(p,"moneyz.admin");
const defaults={radius:128,query:"",moneyzOnly:false};
function nearby(player,ctx){const term=ctx.query.trim().toLowerCase();return [...player.dimension.getEntities({type:"minecraft:npc",location:player.location,maxDistance:ctx.radius})].filter(n=>{const ss=NpcServices.list(n);return (!ctx.moneyzOnly||ss.length>0)&&(!term||[npcLabel(n),...ss.map(s=>`${NpcServices.resolve(s)?.label??s.label} ${s.id} ${JSON.stringify(s.args??{})}`)].join(" ").toLowerCase().includes(term));}).sort((a,b)=>distance(player,a)-distance(player,b));}
export function npcManager(player,options={}){
 if(!allowed(player)){Feedback.message(player,"§cMoneyz admin access required.");return;}
 const ctx={...defaults,...options},radius=new ObservableString(String(ctx.radius),{clientWritable:true}),query=new ObservableString(ctx.query,{clientWritable:true}),only=new ObservableBoolean(ctx.moneyzOnly,{clientWritable:true}),form=new CustomForm(player,"NPC Manager").requiresPermission("moneyz.admin").shortcut({type:"service",id:"moneyz:admin/npcs",label:"NPC Manager"});
 form.header("Find NPCs").label("Search loaded NPCs in this dimension.\nAdmins can also sneak-interact with any NPC to edit it directly.")
 .textField("Search name, service, or namespace",query).textField("Search radius (blocks)",radius,{description:"16–1024 blocks; distant NPCs must be in loaded chunks."}).toggle("Moneyz NPCs only",only)
 .button("Search NPCs",()=>nav(form,()=>selectNpc(player,{radius:Math.max(16,Math.min(1024,Number(radius.getData())||128)),query:query.getData(),moneyzOnly:only.getData()})))
 .button("Back to Admin",()=>nav(form,()=>moneyzAdmin(player))).closeButton().show();
}
function selectNpc(player,ctx){
 const npcs=nearby(player,ctx),pick=new ObservableNumber(0,{clientWritable:true}),form=new CustomForm(player,"NPC Search Results").requiresPermission("moneyz.admin");
 const info=new ObservableString("");const refresh=()=>{const n=npcs[pick.getData()];info.setData(n?`${npcLabel(n)}\nDistance: ${distance(player,n)} blocks\nPosition: ${Math.floor(n.location.x)}, ${Math.floor(n.location.y)}, ${Math.floor(n.location.z)}\nServices: ${NpcServices.list(n).map(s=>s.label||s.id).join(", ")||"None"}`:"");};pick.subscribe(refresh);refresh();
 form.label(`${npcs.length} matching loaded NPCs within ${ctx.radius} blocks.`);
 if(npcs.length)form.dropdown("NPC",pick,npcs.map((n,i)=>({label:`${i+1}. ${npcLabel(n)} (${distance(player,n)} blocks) • ${position(n)}`,value:i}))).label(info).button("Edit Selected NPC",()=>nav(form,()=>editNpc(player,npcs[pick.getData()],ctx)));
 else form.label("Try a wider radius, a shorter search, or load the area containing the NPC.");
 form.button("Refresh Results",()=>nav(form,()=>selectNpc(player,ctx))).button("Change Search",()=>nav(form,()=>npcManager(player,ctx))).button("Back to Admin",()=>nav(form,()=>moneyzAdmin(player))).closeButton().show();
}
export function editNpc(player,npc,ctx=defaults){
 if(!allowed(player)){Feedback.message(player,"§cMoneyz admin access required.");return;}
 try{if(npc?.typeId!=="minecraft:npc")return npcManager(player,ctx);NpcServices.list(npc);}catch{Feedback.message(player,"§cThat NPC is no longer loaded. Search again.");return npcManager(player,ctx);}
 const services=NpcServices.list(npc),name=new ObservableString(npcLabel(npc),{clientWritable:true}),form=new CustomForm(player,"NPC Editor").requiresPermission("moneyz.admin");
 form.header(npcLabel(npc)).label(`Position: ${Math.floor(npc.location.x)}, ${Math.floor(npc.location.y)}, ${Math.floor(npc.location.z)}\n${services.length} assigned service(s).`)
 .textField("NPC name",name).button("Save NPC Name",()=>{const result=NpcNames.setName(npc,name.getData());if(!result.ok){Feedback.message(player,result.reason==="empty_name"?"§cEnter an NPC name.":result.reason==="npc_name_api_unavailable"?"§cThis Minecraft version does not expose native NPC names to scripts. Use the vanilla NPC editor; Moneyz cannot save this name here.":"§cNPC name could not be saved. Try again while the NPC is loaded.");return;}Feedback.message(player,result.native?`§aNPC renamed to ${result.name}.`:`§aMoneyz NPC name saved as ${result.name}. §eThis runtime cannot edit the vanilla NPC display name.`);nav(form,()=>editNpc(player,npc,ctx));})
 .divider().button("Add Shop",()=>nav(form,()=>addShop(player,npc,ctx))).button("Add Service",()=>nav(form,()=>addMenu(player,npc,ctx)));
 if(services.length)form.button("Edit Assigned Services",()=>nav(form,()=>assignedServices(player,npc,ctx))).button("Clear All Services",()=>nav(form,()=>confirmClear(player,npc,ctx)));
 form.button("Back to Search",()=>nav(form,()=>selectNpc(player,ctx))).button("Back to Admin",()=>nav(form,()=>moneyzAdmin(player))).closeButton().show();
}
function confirmClear(player,npc,ctx){const f=new CustomForm(player,"Clear NPC Services").requiresPermission("moneyz.admin");f.label(`Remove all Moneyz services from ${npcLabel(npc)}?`).button("Confirm Clear",()=>{NpcServices.clear(npc,{actor:player});nav(f,()=>editNpc(player,npc,ctx));}).button("Cancel",()=>nav(f,()=>editNpc(player,npc,ctx))).closeButton().show();}
function addShop(player,npc,ctx,query=""){
 const term=query.trim().toLowerCase(),ids=Object.keys(Shops.getShopData()).filter(id=>{const s=Shops.getShop(id);return s?.settings?.allowNpcBinding!==false&&(!term||`${s.name} ${id}`.toLowerCase().includes(term));}),pick=new ObservableNumber(0,{clientWritable:true}),label=new ObservableString("",{clientWritable:true}),search=new ObservableString(query,{clientWritable:true}),f=new CustomForm(player,"Add Shop").requiresPermission("moneyz.admin");
 f.textField("Search shops",search).button("Search",()=>nav(f,()=>addShop(player,npc,ctx,search.getData())));
 if(ids.length)f.dropdown("Shop",pick,ids.map((id,i)=>({label:Shops.getShop(id)?.name??id,value:i}))).textField("Button label (optional)",label).button("Add Shop",()=>{const r=NpcServices.add(npc,{type:"shop",id:ids[pick.getData()],label:label.getData().trim()},{actor:player});Feedback.message(player,r.ok?"§aShop added.":"§cCould not add shop.");nav(f,()=>editNpc(player,npc,ctx));});else f.label("No matching shops allow NPC binding.");
 f.button("Back",()=>nav(f,()=>editNpc(player,npc,ctx))).closeButton().show();
}
function addMenu(player,npc,ctx,category="",query=""){
 const all=Services.list().filter(s=>s.id!=="moneyz:shop"&&s.id!=="moneyz:custom_shop"),cats=["",...new Set(all.map(s=>s.category))],cat=new ObservableNumber(Math.max(0,cats.indexOf(category)),{clientWritable:true}),search=new ObservableString(query,{clientWritable:true}),term=query.trim().toLowerCase(),rows=all.filter(s=>(!category||s.category===category)&&(!term||`${s.label} ${s.id}`.toLowerCase().includes(term))),pick=new ObservableNumber(0,{clientWritable:true}),f=new CustomForm(player,"Add Moneyz Service").requiresPermission("moneyz.admin");
 const info=new ObservableString("");const refresh=()=>{const s=rows[pick.getData()];info.setData(s?`${s.label}\nCategory: ${pretty(s.category)}\nService ID: ${s.id}`:"");};pick.subscribe(refresh);refresh();
 f.dropdown("Category",cat,cats.map((c,i)=>({label:c?pretty(c):"All Categories",value:i}))).textField("Search services",search).button("Apply Filters",()=>nav(f,()=>addMenu(player,npc,ctx,cats[cat.getData()],search.getData())));
 if(rows.length)f.dropdown("Service",pick,rows.map((s,i)=>({label:s.label,value:i}))).label(info).button("Configure Service",()=>nav(f,()=>configureService(player,npc,ctx,{type:"service",id:rows[pick.getData()].id},null)));
 else f.label("No matching services. Change your filters.");
 f.button("Back",()=>nav(f,()=>editNpc(player,npc,ctx))).closeButton().show();
}
function assignedServices(player,npc,ctx){const rows=NpcServices.list(npc),pick=new ObservableNumber(0,{clientWritable:true}),f=new CustomForm(player,"Assigned Services").requiresPermission("moneyz.admin"),info=new ObservableString("");const refresh=()=>{const s=rows[pick.getData()];info.setData(s?`${s.id}\n${Object.entries(s.args??{}).map(([k,v])=>`${k}: ${v}`).join("\n")}`:"");};pick.subscribe(refresh);refresh();if(rows.length)f.dropdown("Service",pick,rows.map((s,i)=>({label:NpcServices.resolve(s)?.label??s.label??s.id,value:i}))).label(info).button("Edit Selected",()=>nav(f,()=>configureService(player,npc,ctx,rows[pick.getData()],pick.getData()))).button("Remove Selected",()=>{NpcServices.remove(npc,pick.getData(),{actor:player});nav(f,()=>assignedServices(player,npc,ctx));});else f.label("No services assigned.");f.button("Back",()=>nav(f,()=>editNpc(player,npc,ctx))).closeButton().show();}
function configureService(player,npc,ctx,service,index){const scoped=["moneyz:hotel","moneyz:realtor"].includes(service.id),label=new ObservableString(service.label??"",{clientWritable:true}),fields=Object.fromEntries(["namespace","buildingId","communityId","provider"].map(k=>[k,new ObservableString(service.args?.[k]??"",{clientWritable:true})])),f=new CustomForm(player,"Configure NPC Service").requiresPermission("moneyz.admin");f.label(`${Services.get(service.id)?.label??Shops.getShop(service.id)?.name??service.id}\n${service.id}`).textField("Button label (optional)",label);if(scoped){f.header("Property Filters").label("Use matching groups on the rooms or properties. Blank fields include every group.");for(const [key,obs] of Object.entries(fields))f.textField({namespace:"Namespace / hotel",buildingId:"Building ID",communityId:"Community ID",provider:"Provider"}[key],obs);}
 f.button(index===null?"Add Service":"Save Changes",()=>{const args={...service.args};if(scoped)for(const [key,obs] of Object.entries(fields)){const value=obs.getData().trim();if(value)args[key]=value.toLowerCase();else delete args[key];}const next={...service,label:label.getData().trim(),args:Object.keys(args).length?args:undefined};let r;if(index===null)r=NpcServices.add(npc,next,{actor:player});else{const rows=NpcServices.list(npc);rows[index]=next;r=NpcServices.save(npc,rows,{actor:player});}Feedback.message(player,r.ok?"§aNPC service saved.":"§cCould not save service.");nav(f,()=>editNpc(player,npc,ctx));}).button("Back",()=>nav(f,()=>editNpc(player,npc,ctx))).closeButton().show();}
