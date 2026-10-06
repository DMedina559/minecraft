import { defer } from "../ui/navigation.js";
import * as Feedback from "../core/feedback.js";
import { ui as Extensions } from "../api/extensions.js";
import * as Permissions from "../core/permissions.js";
import { system } from "@minecraft/server";
import { CustomForm, ObservableNumber, ObservableString, ObservableBoolean } from "../ui/ddui.js";
import { configureShortcuts } from "../ui/navigation.js";
import * as Shortcuts from "../core/shortcuts.js";
import * as Services from "../api/services.js";
import * as Shops from "../repositories/shops.js";
const pretty=s=>String(s).replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());
const tick=()=>new Promise(resolve=>defer(resolve));
const details=d=>[d.id,...Object.entries(d.args??{}).map(([key,value])=>`${key}: ${value}`)].join("\n");
function access(player,d){if(d.type==="menu"){const item=Extensions.listMenuItems().find(x=>x.id===d.id);try{return !!item&&(!item.visible||item.visible(player));}catch{return false;}}if(d.type==="shop"){const s=Shops.getShop(d.id);return !!s&&s.enabled!==false&&s.settings?.allowDirectAccess!==false&&(!s.settings?.permission||Permissions.has(player,s.settings.permission))&&Services.canOpen("moneyz:shop",player,{shopId:d.id}).ok;}return Services.canOpen(d.id,player,{args:d.args??{},source:"shortcut"}).ok;}
function open(player,d){if(d.type==="menu"){const item=Extensions.listMenuItems().find(x=>x.id===d.id);if(access(player,d))return item?.open?.(player);return;}return Services.open(d.type==="shop"?"moneyz:shop":d.id,player,{source:"shortcut",args:d.type==="shop"?{shopId:d.id}:d.args??{},...(d.type==="shop"?{shopId:d.id}:{})});}
async function screen(player,title,build){let choice={kind:"back"};const f=new CustomForm(player,title).navigation(false);const choose=value=>{choice=value;f.close();};build(f,choose);f.closeButton();await f.show();await tick();return choice;}
function catalog(player){return [
 ...Extensions.listMenuItems().filter(item=>{try{return !item.visible||item.visible(player);}catch{return false;}}).map(item=>({type:"menu",id:item.id,label:item.label??item.id,category:"add_ons",args:{}})),
 ...Services.list().filter(s=>!["moneyz:shortcuts","moneyz:shop"].includes(s.id)&&Services.canOpen(s.id,player).ok).map(s=>({type:"service",id:s.id,label:s.label,category:s.category,args:{}})),
 ...Object.entries(Shops.getShopData()).filter(([,s])=>s.enabled!==false&&s.settings?.showInBrowser!==false&&s.settings?.allowDirectAccess!==false&&(!s.settings?.permission||Permissions.has(player,s.settings.permission))).map(([id,s])=>({type:"shop",id,label:s.name??pretty(id),category:"shops",args:{}}))
 ];}
export async function shortcutsOverlay(player,{route,title="Previous Screen",initialView="home"}={}){
 let view=initialView,selected=0;
 for(;;){
  let outcome;
  if(view==="home"){
   const rows=Shortcuts.list(player);
   outcome=await screen(player,"My Shortcuts",(f,choose)=>{
    f.header("Quick Access").label(`${rows.length} / ${Shortcuts.limit} saved destinations.\nShortcuts open menus; they never perform purchases or admin actions.`);
    if(rows.length){const pick=new ObservableNumber(0,{clientWritable:true}),info=new ObservableString("");const refresh=()=>{const d=rows[pick.getData()];info.setData(d?[d.label,...Object.entries(d.args??{}).map(([key,value])=>`${key}: ${value}`)].join("\n"):"");};pick.subscribe(refresh);refresh();f.dropdown("Saved destination",pick,rows.map((d,i)=>({label:d.label,value:i}))).label(info).button("Open Selected",()=>choose({kind:"open",destination:rows[pick.getData()]}));}
    else f.label("No shortcuts yet. Add a destination to get started.");
    if(route&&route.id!=="moneyz:shortcuts")f.button("Save This Destination",()=>choose({kind:"save",destination:{...route,label:route.label??title}}));
    f.button("Add Shortcut",()=>choose({kind:"add"}));
    f.button("Sound Settings",()=>choose({kind:"audio"}));
    if(rows.length)f.button("Manage Shortcuts",()=>choose({kind:"manage"}));
    f.button("Back",()=>choose({kind:"back"}));
   });
  }else if(view==="add"){
   const all=catalog(player),categories=[...new Set(all.map(d=>d.category))].sort(),category=new ObservableNumber(0,{clientWritable:true}),search=new ObservableString("",{clientWritable:true});
   outcome=await screen(player,"Add Shortcut",(f,choose)=>{f.label("Choose a category, then find a destination.");if(categories.length)f.dropdown("Category",category,categories.map((c,i)=>({label:pretty(c),value:i}))).textField("Search (optional)",search).button("Find Destinations",()=>choose({kind:"results",category:categories[category.getData()],query:search.getData()}));else f.label("No destinations available.");f.button("Back",()=>choose({kind:"home"}));});
  }else if(view==="audio"){
   const prefs=Feedback.preferences(player),obs=Object.fromEntries(["enabled","success","received","error","navigation"].map(k=>[k,new ObservableBoolean(prefs[k],{clientWritable:true})])),volume=new ObservableNumber(Math.round(prefs.volume*100),{clientWritable:true});
   outcome=await screen(player,"Sound Settings",(f,choose)=>{
    f.label("Personal audio preferences. Save changes before previewing.");
    for(const [key,label] of Object.entries({enabled:"Audio feedback",success:"Successful actions",received:"Incoming payments",error:"Failures / rejection",navigation:"Menu clicks"}))f.toggle(label,obs[key]);
    f.slider("Volume %",volume,0,100,{step:5});
    f.button("Save Settings",()=>{Feedback.setPreferences(player,{...Object.fromEntries(Object.entries(obs).map(([k,v])=>[k,v.getData()])),volume:volume.getData()/100});Feedback.success(player);choose({kind:"audio"});});
    f.button("Preview Success",()=>Feedback.success(player)).button("Preview Failure",()=>Feedback.error(player)).button("Back",()=>choose({kind:"home"}));
   });
  }else if(view==="manage"){
   const rows=Shortcuts.list(player),pick=new ObservableNumber(0,{clientWritable:true});
   outcome=await screen(player,"Manage Shortcuts",(f,choose)=>{if(rows.length)f.dropdown("Shortcut",pick,rows.map((d,i)=>({label:d.label,value:i}))).button("Edit Selected",()=>choose({kind:"edit",index:pick.getData()}));else f.label("No shortcuts saved.");f.button("Back",()=>choose({kind:"home"}));});
  }else if(view==="edit"){
   const rows=Shortcuts.list(player),d=rows[selected];if(!d){view="manage";continue;}const name=new ObservableString(d.label,{clientWritable:true});
   outcome=await screen(player,"Edit Shortcut",(f,choose)=>{f.label(details(d)).textField("Name",name).button("Save Name",()=>{Shortcuts.rename(player,selected,name.getData());choose({kind:"manage"});});if(selected>0)f.button("Move Up",()=>{Shortcuts.move(player,selected,selected-1);choose({kind:"manage"});});if(selected+1<rows.length)f.button("Move Down",()=>{Shortcuts.move(player,selected,selected+1);choose({kind:"manage"});});f.button("Remove Shortcut",()=>{Shortcuts.remove(player,selected);choose({kind:"manage"});}).button("Back",()=>choose({kind:"manage"}));});
  }
  if(outcome.kind==="back")return {};
  if(outcome.kind==="open"){
   const d=outcome.destination;if(!d||!access(player,d)){Feedback.message(player,"§cThis destination is unavailable or you no longer have access.");continue;}
   return {open:()=>open(player,d)};
  }
  if(outcome.kind==="save"){
   try{const r=Shortcuts.add(player,outcome.destination);Feedback.message(player,r.ok?(r.alreadySaved?"§7That destination is already saved.":"§aShortcut saved."):"§cShortcut limit reached. Remove an old shortcut first.");}catch(e){Feedback.message(player,`§cCould not save shortcut: ${e.message}`);}view="home";
  }else if(outcome.kind==="results"){
   const term=String(outcome.query).trim().toLowerCase(),rows=catalog(player).filter(d=>d.category===outcome.category&&(!term||`${d.label} ${d.id}`.toLowerCase().includes(term))),pick=new ObservableNumber(0,{clientWritable:true});
   const chosen=await screen(player,"Choose Destination",(f,choose)=>{f.label(`${rows.length} matching destinations.`);if(rows.length)f.dropdown("Destination",pick,rows.map((d,i)=>({label:d.label,value:i}))).button("Configure Shortcut",()=>choose({kind:"configure",destination:rows[pick.getData()]}));else f.label("Try another search or category.");f.button("Back",()=>choose({kind:"back"}));});
   if(chosen.kind==="configure"){
    const d=chosen.destination,label=new ObservableString(d.label,{clientWritable:true}),namespace=new ObservableString("",{clientWritable:true});
    await screen(player,"Save Shortcut",(f,choose)=>{f.label(details(d)).textField("Shortcut name",label);if(["moneyz:hotel","moneyz:realtor"].includes(d.id))f.textField("Namespace (optional)",namespace,{description:"Blank includes all properties. Use a hotel or community namespace to filter."});f.button("Save",()=>{const r=Shortcuts.add(player,{...d,label:label.getData(),args:namespace.getData().trim()?{namespace:namespace.getData().trim().toLowerCase()}:d.args});Feedback.message(player,r.ok?"§aShortcut saved.":"§cShortcut limit reached.");choose({kind:"back"});}).button("Back",()=>choose({kind:"back"}));});view="home";
   }else view="add";
  }else {view=outcome.kind;selected=outcome.index??selected;}
 }
}
export async function openShortcuts(player){const next=await shortcutsOverlay(player);defer(next.open??(()=>Services.open("moneyz:menu",player,{source:"shortcuts"})));}
configureShortcuts(shortcutsOverlay);

export async function openSoundSettings(player){const next=await shortcutsOverlay(player,{initialView:"audio"});defer(next.open??(()=>Services.open("moneyz:menu",player,{source:"audio_settings"})));}
