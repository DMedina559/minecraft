import * as Products from "../core/products.js";
import { withRoute } from "../ui/navigation.js";
import { defer } from "../ui/navigation.js";
import { CustomForm, ObservableString } from "../ui/ddui.js";
import { openHotel } from "./reservations.js";
import { openProducts } from "./products.js";
import * as Permissions from "../core/permissions.js";
import { system } from "@minecraft/server";
import { ActionFormData } from "../ui/forms.js";
import * as Economy from "../core/economy.js";
import * as Config from "../core/config.js";
import { openRewardsMenu } from "./rewards_menu.js";
import { moneyzAdmin } from "./admin_menu.js";
import { luckyMenu } from "./lucky_menu.js";
import { getShopData } from "../data_provider.js";
import { openAtm } from "./atm.js";
import { openSendMoney } from "./send_money.js";
import { openHelp } from "./help.js";
import { openJobs } from "./jobs.js";
import { openProperties } from "./properties.js";
import { showShopCategories } from "./main_shop.js";
import { giveQuest } from "./quest_menu.js";
import { log, LOG_LEVELS } from "../logger.js";
import { ui as uiExtensions } from "../api/extensions.js";

export function main(player, category="") {
    if(!player)return;
    const names={money:"Shopping & Money",properties:"Work & Properties",rewards:"Rewards & Games",more:"More"};
    const form=new CustomForm(player,names[category]??"Moneyz Menu").shortcut({type:"service",id:"moneyz:menu",label:"Moneyz Menu"});
    const go=fn=>{try{if(form.isShowing())form.close();}catch{}defer(()=>withRoute(form._route,fn));};
    form.label(`Welcome ${player.nameTag}!\nBalance: ${Economy.getBalance(player)} Moneyz`);
    const summaries={"Shopping & Money":"Shops, exchanges and transfers", "Work & Properties":"Jobs, homes and hotel rooms", "Rewards & Games":"Quests, daily rewards and games", "More":"Add-ons, help and credits"};
    const add=(label,fn)=>summaries[label]?form.card(label,summaries[label],"Open",()=>go(fn)):form.button(label,()=>go(fn));
    if(!category){
        add("Shopping & Money",()=>main(player,"money"));
        add("Work & Properties",()=>main(player,"properties"));
        add("Rewards & Games",()=>main(player,"rewards"));
        add("More",()=>main(player,"more"));
        if(Permissions.has(player,"moneyz.admin"))add("Admin",()=>moneyzAdmin(player));
        add("Help",()=>openHelp(player));
    }else if(category==="money"){
        if(Config.bool("moneyzShop",true,player))add("Shops",()=>shops(player));
        if(Config.bool("moneyzATM",true,player))add("ATM Exchange",()=>openAtm(player));
        if(Config.bool("moneyzSend",true,player))add("Send Moneyz",()=>openSendMoney(player));

    }else if(category==="properties"){
        add("Jobs & Employment",()=>openJobs(player));add("Real Estate",()=>openProperties(player));add("Hotel Reservations",()=>openHotel(player));
    }else if(category==="rewards"){
        if(Config.bool("moneyzQuest",true,player))add("Quests",()=>giveQuest(player));
        if(Config.bool("moneyzDaily",true,player))add("Daily Rewards",()=>openRewardsMenu(player));
        if(Config.bool("moneyzLucky",true,player)||Config.bool("moneyzChance",true,player))add("Games & Lucky Purchase",()=>luckyMenu(player));
    }else{
        add("Add-on Menus",()=>extensionMenus(player));add("Help",()=>openHelp(player));add("Credits",()=>Credits(player));
    }
    if(category)add("Back to Main Menu",()=>main(player));
    form.closeButton().show().catch(err=>log(`Main menu: ${err}`,LOG_LEVELS.ERROR));
}
function extensionMenus(player,page=0){
    const rows=uiExtensions.listMenuItems().filter(item=>{try{return !item.visible||item.visible(player);}catch{return false;}}),pages=Math.max(1,Math.ceil(rows.length/8)),current=Math.max(0,Math.min(pages-1,page)),f=new CustomForm(player,"Add-on Menus");
    const go=fn=>{try{if(f.isShowing())f.close();}catch{}defer(()=>withRoute(f._route,fn));};
    f.label(`Page ${current+1} / ${pages}`);if(!rows.length)f.label("No add-on menus registered.");
    for(const item of rows.slice(current*8,(current+1)*8))f.button(item.label??item.id,()=>go(()=>item.open?.(player)));
    if(current>0)f.button("Previous Page",()=>go(()=>extensionMenus(player,current-1)));
    if(current+1<pages)f.button("Next Page",()=>go(()=>extensionMenus(player,current+1)));
    f.button("Back",()=>go(()=>main(player,"more"))).closeButton().show();
}

export function shops(player,query="",page=0){
 const data=getShopData(),term=query.trim().toLowerCase(),ids=Object.keys(data).filter(id=>data[id]?.enabled!==false&&data[id]?.settings?.showInBrowser!==false&&(!term||`${data[id]?.name??id} ${id}`.toLowerCase().includes(term))).sort((a,b)=>String(data[a]?.name??a).localeCompare(String(data[b]?.name??b))),pages=Math.max(1,Math.ceil(ids.length/10)),current=Math.max(0,Math.min(pages-1,page)),search=new ObservableString(query,{clientWritable:true}),f=new CustomForm(player,"All Shops").shortcut({type:"service",id:"moneyz:shops",label:"All Shops"});
 const go=fn=>{try{if(f.isShowing())f.close();}catch{}defer(()=>withRoute(f._route,fn));};
 f.label(`Balance: ${Economy.getBalance(player)} Moneyz`).textField("Search shops",search).button("Search",()=>go(()=>shops(player,search.getData(),0))).label(`${ids.length} shops • Page ${current+1} / ${pages}`);
 const products=Products.list();
 const bundles=products.filter(p=>p.type!=="pet");
 if(bundles.length&&(!term||"products bundles services".includes(term)))f.card("Products & Bundles",`${bundles.length} available`,"Browse Products",()=>go(()=>openProducts(player)));

 for(const id of ids.slice(current*10,(current+1)*10))f.card(data[id]?.name??id,`${data[id]?.listings?.length??0} listings`,"Browse Shop",()=>go(()=>showShopCategories(player,id)));
 if(!ids.length&&!(bundles.length&&(!term||"products bundles services".includes(term))))f.label("No matching shops. Try another search.");
 if(current>0)f.button("Previous Page",()=>go(()=>shops(player,query,current-1)));
 if(current+1<pages)f.button("Next Page",()=>go(()=>shops(player,query,current+1)));
 f.button("Back to Main Menu",()=>go(()=>main(player))).closeButton().show();
}

function Credits(player) {
    new ActionFormData()
        .title("§l§1Credits")
        .body("\n§l§5Creator: §dZVortex11325\n§5Link: §dlinktr.ee/dmedina559\n§5Platform API: §d2.0.0")
        .button("§c§lBack")
        .show(player)
        .then(r => {
            if (r.selection === 0) main(player);
        });
}

log("moneyz_menu.js loaded", LOG_LEVELS.DEBUG);
