import { CustomForm } from "../ui/ddui.js";
import { defer,withRoute,contextualPromise } from "../ui/navigation.js";
import * as Products from "../core/products.js";
import * as Shops from "../repositories/shops.js";
import * as Permissions from "../core/permissions.js";
import * as Feedback from "../core/feedback.js";
import { openShop } from "./shop_v3.js";
const nav=(f,fn)=>{try{if(f.isShowing())f.close();}catch{}defer(()=>withRoute(f._route,fn));};
function allowed(player,context={}){const shop=Shops.getShop("petshop");return shop&&shop.enabled!==false&&(!context.isNpcInteraction||shop.settings?.allowNpcBinding!==false)&&(!shop.settings?.permission||Permissions.has(player,shop.settings.permission));}
export function openPetshop(player,context={}){
 if(!allowed(player,context)){Feedback.message(player,"§cPetshop is unavailable.");return;}
 const f=new CustomForm(player,"Petshop").shortcut({type:"shop",id:"petshop",label:"Petshop"}).npcContext(!!context.isNpcInteraction);
 f.card("Pets","Companions tamed to the buyer.","Browse Pets",()=>nav(f,()=>openPets(player,context)))
 .card("Spawn Eggs & Animals","Original animal eggs and buckets; tameable and untameable species.","Browse Spawn Eggs",()=>nav(f,()=>openShop(player,"petshop",{...context,petSection:"spawn_eggs"})))
 .card("Supplies","Food, equipment and pet supplies.","Browse Supplies",()=>nav(f,()=>openShop(player,"petshop",{...context,petSection:"supplies"}))).button("All Shops",()=>nav(f,()=>contextualPromise(import("./moneyz_menu.js")).then(m=>m.shops(player)))).closeButton().show();
}
export function openPets(player,context={},page=0){
 if(!allowed(player,context))return;
 const rows=Products.list({type:"pet"}).filter(p=>p.autoTame!==false),pages=Math.max(1,Math.ceil(rows.length/6)),index=Math.max(0,Math.min(page,pages-1));
 const f=new CustomForm(player,"Tamed Pets").shortcut({type:"service",id:"moneyz:pets",label:"Pets"}).npcContext(!!context.isNpcInteraction);
 f.label(`Page ${index+1} / ${pages}`);if(!rows.length)f.label("No tameable pets registered.");
 let busy=false;
 for(const p of rows.slice(index*6,(index+1)*6))f.card(p.name,`${p.description??""}\n§aPrice: ${p.price} Moneyz\n§7Tamed to you after spawning.`, "Adopt",async()=>{
  if(busy||!allowed(player,context))return;busy=true;try{const result=await Products.purchase(player,p.id,{source:"petshop"});Feedback.message(player,result.ok?`§aAdopted ${p.name}.`:result.reason==="insufficient_funds"?"§cNot enough Moneyz.":result.reason==="refund_failed"?"§cPet delivery and refund failed. Contact an administrator.":"§cPet delivery failed. Your purchase was refunded.");}finally{busy=false;}
 });
 if(index>0)f.button("Previous Page",()=>nav(f,()=>openPets(player,context,index-1)));
 if(index+1<pages)f.button("Next Page",()=>nav(f,()=>openPets(player,context,index+1)));
 f.button("Back to Petshop",()=>nav(f,()=>openPetshop(player,context))).closeButton().show();
}
