# Moneyz Shop Engine v3 Architecture & Reference

**Shop Engine v3** replaces legacy generated buy/sell function trees with a modern, dynamic Script API commerce engine.

---

## 1. Key Features

- **Runtime Item Type Support**: Operates directly on Bedrock `ItemTypes` (`minecraft:diamond`, `minecraft:iron_sword`, etc.).
- **In-Game DDUI Editor**: Admins create and edit shops, categories, prices, bundle quantities, and stock directly in-game via **Moneyz Admin → Manage Shops**.
- **Flexible Stock Modes**:
  - `unlimited`: Infinite shop stock.
  - `tracked`: Finite physical stock count. Purchases decrement stock; player sales replenish shop stock.
- **Dynamic Pricing & Bundle Multipliers**: Define distinct buy/sell bundle quantities (e.g. buy 16 iron ingots for 50 Moneyz; sell 64 iron ingots for 150 Moneyz).
- **Merchant Account Integration**: Shop sales revenue can automatically route to a virtual business account or World Treasury.
- **Independent NPC Shop Binding**: Shops can be bound directly to specific NPC entities without requiring global browser visibility.
- **Refund & Delivery Safety**: Automatic transaction rollback if inventory space is insufficient.

---

## 2. In-Game Admin Commands

```text
/moneyz:shops               - List all registered shop IDs
/moneyz:npc_shop <shopId>   - Bind targeted NPC to open a specific shop
/moneyz:npc_shop_clear      - Clear shop binding from targeted NPC
/moneyz:reload              - Reload shop configuration and cache
```

---

## 3. Public Script API Reference

Import `Moneyz` from `scripts/api/public.js`:

```javascript
import { Moneyz } from "./scripts/api/public.js";

// 1. Create a dynamic shop
Moneyz.shops.createShop({
    id: "farmers_market",
    name: "Farmer's Fresh Market",
    enabled: true,
    settings: {
        allowNpcBinding: true,
        allowDirectAccess: true,
        showInBrowser: true
    }
});

// 2. Add an item listing with tracked stock
Moneyz.shops.addListing("farmers_market", {
    id: "golden_apple_listing",
    typeId: "minecraft:golden_apple",
    name: "Golden Apple",
    category: "produce",
    buy: { enabled: true, price: 150, amount: 1 },
    sell: { enabled: true, price: 75, amount: 1 },
    stock: { mode: "tracked", quantity: 25 }
});

// 3. Query listings in a category
const listings = Moneyz.shops.listListings("farmers_market", { category: "produce" });
console.warn(`Found ${listings.length} listings in produce category.`);

// 4. Programmatically execute a purchase
async function buyItem(player) {
    const quote = Moneyz.commerce.quoteBuy(player, "farmers_market", "golden_apple_listing", 2);
    console.warn(`Quote for 2 bundles: ${quote.totalCost} Moneyz (Can Afford: ${quote.canAfford})`);

    const result = await Moneyz.commerce.buyListing(player, "farmers_market", "golden_apple_listing", 2);
    if (result.ok) {
        player.sendMessage(`§aPurchased ${result.amount} Golden Apples for ${result.total} Moneyz!`);
    } else {
        player.sendMessage(`§cPurchase failed: ${result.reason}`);
    }
}

// 5. Programmatically execute a sale
async function sellItem(player) {
    const result = await Moneyz.commerce.sellListing(player, "farmers_market", "golden_apple_listing", 1);
    if (result.ok) {
        player.sendMessage(`§aSold Golden Apple for ${result.total} Moneyz!`);
    } else {
        player.sendMessage(`§cSale failed: ${result.reason}`);
    }
}
```

---

## 4. NPC Shop Binding via API

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Bind shop directly to an NPC entity
Moneyz.npcShops.assign(npcEntity, "farmers_market");

// Check assigned shop ID
const shopId = Moneyz.npcShops.assigned(npcEntity);
console.warn(`NPC is bound to shop: ${shopId}`);

// Clear assigned shop
Moneyz.npcShops.clear(npcEntity);
```
