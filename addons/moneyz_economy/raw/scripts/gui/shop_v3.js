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
const nav = (form, fn) => { try { if (form.isShowing()) form.close(); } catch {} system.run(fn); };
const pretty = s => String(s ?? "").replace(/^minecraft:/, "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const hub = player => import("./moneyz_menu.js").then(m => m.main(player));
const browser = player => import("./moneyz_menu.js").then(m => m.shops(player));

// Carry access context and catalog position through every screen and return.
export function openShop(player, shopId, context = {}) {
    const { isNpcInteraction = false, source = "direct", category = "", query = "", page = 0 } = context;
    const shop = Shops.getShop(shopId);
    if (!shop || shop.enabled === false) { player.sendMessage("§cThat shop is unavailable."); return; }
    if (shop.settings?.permission && !Permissions.has(player, shop.settings.permission)) { player.sendMessage("§cYou do not have permission to use this shop."); return; }
    if (isNpcInteraction && shop.settings?.allowNpcBinding === false) { player.sendMessage("§cThis shop is not available through NPCs."); return; }
    if (!isNpcInteraction && source !== "browser" && shop.settings?.allowDirectAccess === false) { player.sendMessage("§cDirect access to this shop is disabled."); return; }
    const all = Shops.listListings(shopId, { enabledOnly: true });
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
    const form = new CustomForm(player, shop.name ?? pretty(shopId));
    form.label(`§6Balance: §g${Economy.getBalance(player)} Moneyz\n§7Choose an item to buy or sell.`)
        .dropdown("Category", cat, cats.map((x, i) => ({ label: x ? pretty(x) : "All Categories", value: i })))
        .textField("Search Items", search, { description: "Item name, ID, or category" })
        .button("Apply Filters", () => nav(form, () => openShop(player, shopId, { ...ctx, category: cats[cat.getData()] ?? "", query: search.getData(), page: 0 })));
    if (selectedCategory || term) form.button("Clear Filters", () => nav(form, () => openShop(player, shopId, { ...ctx, category: "", query: "", page: 0 })));
    form.divider().header(`Items • ${rows.length} results • Page ${currentPage + 1}/${pages}`);
    if (!rows.length) form.label(all.length ? "No matching items. Clear or change your filters." : "This shop has no available listings.");
    for (const x of rows.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)) {
        const prices = [x.buy.enabled ? `Buy ${x.buy.amount}: ${x.buy.price} M` : "", x.sell.enabled ? `Sell ${x.sell.amount}: ${x.sell.price} M` : ""].filter(Boolean).join(" • ");
        form.button(buttonText(`${x.name}\n${prices || "Trading disabled"}`), () => nav(form, () => openListing(player, shopId, x.id, ctx)));
    }
    if (currentPage > 0) form.button("Previous Page", () => nav(form, () => openShop(player, shopId, { ...ctx, page: currentPage - 1 })));
    if (currentPage + 1 < pages) form.button("Next Page", () => nav(form, () => openShop(player, shopId, { ...ctx, page: currentPage + 1 })));
    form.divider();
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
    const form = new CustomForm(player, x.name);
    const details = x.itemTemplate ? ItemTemplates.describe(x.itemTemplate) : x.typeId;
    form.label(`§7${shop?.name ?? pretty(shopId)} / ${pretty(x.category)} / ${x.name}`)
        .header("Item Details").label(`§f${details}\n§7Item ID: ${x.typeId}`).divider().header("Prices")
        .label(`${x.buy.enabled ? `§aBUY  §f${x.buy.amount} for §g${x.buy.price} Moneyz` : "§7BUY  Disabled"}\n${x.sell.enabled ? `§eSELL §f${x.sell.amount} for §g${x.sell.price} Moneyz` : "§7SELL Disabled"}`)
        .divider().label(status).slider("Quantity", qty, 1, 64, { step: 1, description: "Number of listing bundles" });
    let busy = false;
    const trade = async (direction, all = false) => {
        if (busy) return;
        busy = true;
        try {
            const count = all ? Math.floor(Inventory.count(player, x.typeId) / Math.max(1, x.sell.amount)) : qty.getData();
            if (count < 1) { refresh("§cNo complete bundles to sell."); return; }
            const r = await Commerce[direction === "buy" ? "buyListing" : "sellListing"](player, shopId, listingId, count);
            refresh(r.ok ? `§a${direction === "buy" ? "Purchased" : "Sold"} ${r.amount} ${x.name} for ${r.total} Moneyz.` : `§cTrade failed: ${r.reason}`);
        } catch { refresh("§cTrade failed. Please try again."); }
        finally { busy = false; }
    };
    if (x.buy.enabled) form.button(`BUY • ${x.buy.price} Moneyz / bundle`, () => trade("buy"));
    if (x.sell.enabled) form.button(`SELL • ${x.sell.price} Moneyz / bundle`, () => trade("sell"))
        .button("SELL ALL • All complete bundles", () => trade("sell", true));
    form.divider().button("Back to Items", () => nav(form, () => openShop(player, shopId, ctx)))
        .button("Main Menu", () => nav(form, () => hub(player))).closeButton().show();
}
