# Moneyz Shop Engine v3

Shop Engine v3 replaces generated buy/sell functions as the primary commerce path.

## Features
- Runtime item registry via `ItemTypes.getAll()` / `ItemTypes.get()`
- In-game DDUI shop creation and listing editor
- Default catalog seeded from `moneyz_items_rebalanced_v2_expanded.txt`
- Native Script API inventory give/remove
- Fixed or tracked stock
- Player-driven stock replenishment when selling
- Pricing modifier and fee pipelines
- Optional merchant account credit
- NPC shop binding independent of NPC name/dialogue
- Public API CRUD for shops/listings and commerce quotes/purchases/sales
- Legacy shop properties are read/migrated into the v3 model

## Commands
`/moneyz:shops` lists shop IDs.
`/moneyz:npc_shop <shopId> [npc]` binds a shop to an NPC.
`/moneyz:npc_shop_clear` clears the nearest NPC shop binding.

## Public API
```js
Moneyz.shops.createShop({ id: "msv:market", name: "Mountain Market" });
Moneyz.shops.addListing("msv:market", {
  typeId: "minecraft:diamond", category: "resources",
  buy: { enabled: true, amount: 1, price: 350 },
  sell: { enabled: true, amount: 1, price: 190 },
  stock: { mode: "unlimited", quantity: 0 }
});
await Moneyz.commerce.buyListing(player, "msv:market", listingId, 1);
```

The old function/dialogue assets can remain for world compatibility, but new dynamic shops do not require generated functions or dialogue files.
