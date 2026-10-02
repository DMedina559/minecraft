# Moneyz Services API

```js
import { Moneyz } from "./api/public.js";

Moneyz.services.list();
Moneyz.services.exists("moneyz:atm");
Moneyz.services.open("moneyz:atm", player);

Moneyz.services.register({
  id: "msv:property_office",
  label: "Property Office",
  category: "roleplay",
  canOpen(player) { return true; },
  open(player, context) { /* show MSV UI */ }
});
```

A registered service automatically becomes available to systems that enumerate `Moneyz.services`, including the Moneyz NPC Manager.

## Specific shops
A shop remains distinct from the global shop browser. Bind a selected shop to an NPC with the NPC Manager or `/moneyz:npc_shop msv:commu_market`. This stores a shop service entry and opens only that shop.

Shop Engine settings can hide a shop from the global browser while keeping NPC access enabled.
