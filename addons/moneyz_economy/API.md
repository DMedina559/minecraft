# Moneyz Platform Public API 2.0

Moneyz 2.0 turns the economy pack into an extensible Bedrock platform. Integrations should import only `scripts/api/public.js`; internal module paths are not part of the compatibility contract.

## Core facade

```js
import { Moneyz } from "./api/public.js";

Moneyz.apiVersion;      // 2.0.0
Moneyz.capabilities;    // feature discovery
```

Public namespaces include `economy`, `transactions`, `accounts`, `merchants`, `players`, `shops`, `quests`, `rewards`, `instruments`, `extensions`, `npcs`, `storage`, `permissions`, `policies`, `audit`, `metrics`, `pricing`, `fees`, `notify`, `scheduler`, `escrow`, `invoices`, `terminals`, `components`, `ui`, `events`, `results`, and `dev`.

## Extension manifests

```js
Moneyz.extensions.register({
  id: "msv:core",
  name: "MountainSide Villages",
  version: "2.0.0",
  requires: { moneyz: ">=2.0.0" },
  onLoad(ctx) { /* register features */ }
});
```

All extension-owned IDs should be namespaced (`author:feature`). Duplicate registry IDs are rejected.

## Namespaced storage

```js
const worldStore = Moneyz.storage.namespace("msv");
worldStore.set("economy", { enabled: true });

const profile = Moneyz.storage.player(player, "msv");
profile.set("job", "police");
```

This gives extensions a consistent serialization and naming convention without exposing Moneyz's own persistence keys.

## Permissions and policies

```js
Moneyz.permissions.register("msv.business.manage");
Moneyz.permissions.addProvider({
  has(player, permission) {
    if (permission === "msv.business.manage") return player.hasTag("businessManager");
  }
});

Moneyz.policies.register({
  id: "msv:jail",
  authorize(ctx) {
    if (ctx.operation === "transfer" && isJailed(ctx.from))
      return { allowed: false, reason: "Transfers unavailable while jailed." };
    return { allowed: true };
  }
});
```

Policies run before Moneyz player economy mutations. Policy handlers are synchronous by design.

## Atomic/compensating transactions

```js
const result = await Moneyz.transaction(async tx => {
  tx.withdraw(player, 500);
  tx.accountDeposit("business:commu_market", 500);
  const delivered = giveProduct(player);
  if (!delivered) throw new Error("delivery_failed");
});
```

Moneyz records compensating operations and runs them in reverse if the transaction body throws. This is application-level compensation, not a database ACID transaction; external side effects should use `tx.compensate()` when they need an undo action.

## Escrow

```js
const escrow = Moneyz.escrow.create({ payer: buyer, amount: 500 });
escrow.release(seller); // player or virtual account ID
// or escrow.refund();
```

Useful for trades, auctions, contracts, property sales and deposits.

## Invoices

```js
const invoice = Moneyz.invoices.create({
  from: "business:hotel",
  to: player.id,
  amount: 250,
  description: "Room 302"
});
Moneyz.invoices.pay(invoice.id, player);
```

## Pricing and fee providers

```js
Moneyz.pricing.registerModifier({
  id: "msv:employee_discount",
  modify(ctx) { return isEmployee(ctx.player) ? ctx.price * .9 : ctx.price; }
});

Moneyz.fees.register({
  id: "msv:market_fee",
  calculate(ctx) { return { amount: Math.round(ctx.subtotal * .05), recipient: "government:treasury" }; }
});
```

These are primitives; Moneyz does not impose taxes or a particular economic model.

## UI extension API

```js
Moneyz.ui.registerMenuItem({ id:"msv:properties", label:"Property Management", open: openProperties });
Moneyz.ui.registerPage({ id:"msv:business", title:"Business", build(ctx) { /* extension page */ } });
Moneyz.ui.registerAction({ id:"msv:pay_rent", run(ctx) { /* ... */ } });
Moneyz.ui.registerDashboardSection({ id:"msv:dashboard", label:"MountainSide Villages" });
```

The existing main-menu extension registry remains compatible.

## NPCs and terminals

NPCs can be assigned a registered destination independently of their display name:

```text
/moneyz:npc moneyz:quests
```

Extensions can register terminal behavior for blocks/entities/items they own:

```js
Moneyz.terminals.register({
  id:"msv:bank_terminal",
  open(player, context) { openBank(player); }
});
```

`Moneyz.components.registerBlock()` and `registerItem()` expose the Bedrock startup custom-component registries through a stable Moneyz integration point. The extension still supplies the block/item JSON and component parameters.

## Scheduler

```js
Moneyz.scheduler.registerHandler("msv:payroll", job => runPayroll(job));
Moneyz.scheduler.create({ id:"msv:daily_payroll", handlerId:"msv:payroll", intervalMs:86400000 });
```

Schedules persist in world dynamic properties. The callback registration itself must be restored by the extension on load.

## Audit and metrics

```js
Moneyz.audit.record("shop.edited", { actor: player, subject:"msv:market", metadata:{ item:"minecraft:stone" } });
Moneyz.audit.query({ actor: player.name });

Moneyz.metrics.registerMetric("msv:properties_owned", () => countProperties());
const snapshot = Moneyz.metrics.snapshot();
```

Transactions answer what happened to currency; audit entries answer what administrators/systems changed.

## Notifications

```js
Moneyz.notify.success(player, "Payment received");
Moneyz.notify.error(player, "Insufficient Moneyz");
Moneyz.notify.money(player, 250);
```

## Players

```js
Moneyz.players.get(player);
Moneyz.players.getOnline();
Moneyz.players.findById(id);
Moneyz.players.findByName(name);
```

This gives integrations one canonical Moneyz-facing profile abstraction.

## Custom components

```js
Moneyz.components.registerBlock("msv:moneyz_terminal", {
  onPlayerInteract(event) {
    if (event.player) Moneyz.terminals.open("msv:bank_terminal", event.player, { block:event.block });
  }
});
```

Custom component IDs must be namespaced. Their matching JSON is owned by the content pack defining the block/item.

## Developer commands

- `/moneyz:api` — API version and capabilities
- `/moneyz:extensions` — registered extension manifests
- `/moneyz:validate` — runtime validation
- `/moneyz:menus` — registered NPC menu destinations
- `/moneyz:npc <menu> [npc]` — bind a menu destination to an NPC

## Compatibility contract

Moneyz uses semantic API versions. Additive API changes increment minor versions. Breaking public API changes require a new major API version. Internal modules can change without notice; integrations should consume `api/public.js` only.
