import * as Products from "../core/products.js";
import { withRoute } from "../ui/navigation.js";
import { defer, contextualPromise } from "../ui/navigation.js";
import * as Feedback from "../core/feedback.js";
import { system } from "@minecraft/server";
import { CustomForm, ObservableNumber, ObservableString } from "../ui/ddui.js";
import * as ItemTemplates from "../core/item_templates.js";
import * as Shops from "../repositories/shops.js";
import * as Commerce from "../services/commerce.js";
import * as Inventory from "../services/inventory.js";
import * as Economy from "../core/economy.js";
import * as Permissions from "../core/permissions.js";

const PAGE_SIZE = 12;
// DDUI button labels display formatting codes literally; titles and labels support them.
const buttonText = value => String(value ?? "").replace(/§[0-9a-gk-or]/gi, "");
const nav = (form, fn) => { try { if (form.isShowing()) form.close(); } catch {} defer(()=>withRoute(form._route,fn)); };
const pretty = s => String(s ?? "").replace(/^minecraft:/, "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const hub = player => contextualPromise(import("./moneyz_menu.js")).then(m => m.main(player));
const browser = player => contextualPromise(import("./moneyz_menu.js")).then(m => m.shops(player));

// Carry access context and catalog position through every screen and return.
export function openShop(player, shopId, context = {}) {
    const { isNpcInteraction = false, source = "direct", category = "", query = "", page = 0 } = context;
    const shop = Shops.getShop(shopId);
    if (!shop || shop.enabled === false) { Feedback.message(player,"§cThat shop is unavailable."); return; }
    if (shop.settings?.permission && !Permissions.has(player, shop.settings.permission)) { Feedback.message(player,"§cYou do not have permission to use this shop."); return; }
    if (isNpcInteraction && shop.settings?.allowNpcBinding === false) { Feedback.message(player,"§cThis shop is not available through NPCs."); return; }
    if (!isNpcInteraction && source !== "browser" && shop.settings?.allowDirectAccess === false) { Feedback.message(player,"§cDirect access to this shop is disabled."); return; }
    if(shopId==="petshop"&&!context.petSection)return contextualPromise(import("./pets.js")).then(m=>m.openPetshop(player,context));
    const all = Shops.listListings(shopId, { enabledOnly: true }).filter(x=>{if(!context.petSection)return true;const animal=x.typeId.endsWith("_spawn_egg")||x.category==="pets";return context.petSection==="spawn_eggs"?animal:!animal;});
    const cats = ["", ...new Set(all.map(x => x.category ?? "general"))];
    const selectedCategory = cats.includes(category) ? category : "";
    const term = String(query).trim().toLowerCase();
    const rows = all.filter(x => (!selectedCategory || (x.category ?? "general") === selectedCategory) &&
        (!term || `${x.name} ${x.typeId} ${pretty(x.category)}`.toLowerCase().includes(term)));
    const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const currentPage = Math.max(0, Math.min(pages - 1, Number.isFinite(page) ? Math.floor(page) : 0));
    const ctx = { ...context, source, isNpcInteraction, category: selectedCategory, query, page: currentPage };
    const cat = new ObservableNumber(cats.indexOf(selectedCategory), { clientWritable: true });
    const search = new ObservableString(String(query), { clientWritable: true });
    const form = new CustomForm(player, shop.name ?? pretty(shopId)).shortcut({type:"shop",id:shopId,label:shop.name??pretty(shopId)});
    form.label(`Balance: ${Economy.getBalance(player)} Moneyz`);
    form.button(selectedCategory || term ? "Filters (active)" : "Search / Category",()=>nav(form,()=>{
        const filters=new CustomForm(player,"Shop Filters");
        filters.dropdown("Category",cat,cats.map((x,i)=>({label:x?pretty(x):"All Categories",value:i})))
            .textField("Search",search)
            .button("Apply",()=>nav(filters,()=>openShop(player,shopId,{...ctx,category:cats[cat.getData()]??"",query:search.getData(),page:0})))
            .button("Show All Items",()=>nav(filters,()=>openShop(player,shopId,{...ctx,category:"",query:"",page:0})))
            .button("Cancel",()=>nav(filters,()=>openShop(player,shopId,ctx))).closeButton().show();
    }));
    form.divider().header(`Items • ${rows.length} results • Page ${currentPage + 1}/${pages}`);
    if(context.petSection==="spawn_eggs")for(const product of Products.list({type:"pet"}).filter(p=>p.autoTame===false))form.card(product.name,`${product.description??""}\n§aPrice: ${product.price} Moneyz\n§7Untamed animal`,"Purchase Animal",async()=>{const result=await Products.purchase(player,product.id,{source:"petshop_animals"});Feedback.message(player,result.ok?`§aPurchased ${product.name}.`:"§cAnimal delivery failed.");});
    if (!rows.length) form.label(all.length ? "No matching items. Clear or change your filters." : "This shop has no available listings.");
    for (const x of rows.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)) {
        const prices = [x.buy.enabled ? `§aBuy §f${x.buy.amount}: §a${x.buy.price} M` : "", x.sell.enabled ? `§6Sell §f${x.sell.amount}: §6${x.sell.price} M` : ""].filter(Boolean).join("\n");
        form.card(buttonText(x.name),prices || "§7Trading disabled","View Item", () => nav(form, () => openListing(player, shopId, x.id, ctx)));
    }
    if (currentPage > 0) form.button("Previous Page", () => nav(form, () => openShop(player, shopId, { ...ctx, page: currentPage - 1 })));
    if (currentPage + 1 < pages) form.button("Next Page", () => nav(form, () => openShop(player, shopId, { ...ctx, page: currentPage + 1 })));
    form.divider();
    if(context.petSection)form.button("Back to Petshop",()=>nav(form,()=>openShop(player,shopId,{...context,petSection:undefined})));
    if (source === "browser") form.button("All Shops", () => nav(form, () => browser(player)));
    form.button("Main Menu", () => nav(form, () => hub(player))).closeButton().show();
}

function openListing(player, shopId, listingId, ctx) {
    const shop = Shops.getShop(shopId), x = Shops.getListing(shopId, listingId);
    if (!x || x.enabled === false) return openShop(player, shopId, ctx);
    const qty = new ObservableNumber(1, { clientWritable: true });
    const status = new ObservableString("");
    const refresh = message => {
        const live = Shops.getListing(shopId, listingId);
        status.setData(`${message ? `${message}\n\n` : ""}§6Balance: §g${Economy.getBalance(player)} Moneyz\n§fYou have: ${Inventory.count(player, x.typeId)}\n${live?.stock.mode === "unlimited" ? "§7Stock: Unlimited" : `§7Stock: ${live?.stock.quantity ?? 0}`}`);
    };
    refresh();
    const form = new CustomForm(player, x.name).shortcut({type:"shop",id:shopId,label:shop.name??pretty(shopId)});
    const details = x.itemTemplate ? ItemTemplates.describe(x.itemTemplate) : x.typeId;
    form.label(`§7${shop?.name ?? pretty(shopId)} / ${pretty(x.category)} / ${x.name}`)
        .header("Item Details").label(`§f${details}\n§7Item ID: ${x.typeId}`).divider().header("Prices")
        .label(`${x.buy.enabled ? `§aBUY  §f${x.buy.amount} for §g${x.buy.price} Moneyz` : "§7BUY  Disabled"}\n${x.sell.enabled ? `§6SELL §f${x.sell.amount} for §6${x.sell.price} Moneyz` : "§7SELL Disabled"}`)
        .divider().label(status).slider("Quantity", qty, 1, 64, { step: 1, description: "Number of listing bundles" });
    let busy = false;
    const trade = async (direction, all = false) => {
        if (busy) return;
        busy = true;
        try {
            const count = all ? Math.floor(Inventory.count(player, x.typeId) / Math.max(1, x.sell.amount)) : qty.getData();
            if (count < 1) { Feedback.error(player);refresh("§cNo complete bundles to sell."); return; }
            const r = await Commerce[direction === "buy" ? "buyListing" : "sellListing"](player, shopId, listingId, count);
            refresh(r.ok ? `§a${direction === "buy" ? "Purchased" : "Sold"} ${r.amount} ${x.name} for ${r.total} Moneyz.` : `§cTrade failed: ${r.reason}`);
        } catch { Feedback.error(player);refresh("§cTrade failed. Please try again."); }
        finally { busy = false; }
    };
    if (x.buy.enabled) form.button("Buy", () => trade("buy"));
    if (x.sell.enabled) form.button("Sell", () => trade("sell"))
        .button("Sell All", () => trade("sell", true));
    form.divider().button("Back to Items", () => nav(form, () => openShop(player, shopId, ctx)))
        .button("Main Menu", () => nav(form, () => hub(player))).closeButton().show();
}
