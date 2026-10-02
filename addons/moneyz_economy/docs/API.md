# Moneyz SDK / API 2.1

Import the stable facade from `scripts/api/public.js`. Integrations should not import Moneyz storage modules directly.

## Capability discovery

```js
import { Moneyz } from "./scripts/api/public.js";
if (Moneyz.capabilities.quests) { /* register integration */ }
```

## Economy

`getBalance`, `canAfford`, `deposit`, `withdraw`, `setBalance`, and `transfer` remain scoreboard-backed. Supply namespaced metadata (`source`, `pack`, IDs) so transactions are auditable.

## Events

Subscribe with `Moneyz.on(name, callback)`. Important events include `beforeTransaction`, `beforeTransfer`, `balanceChanged`, `transaction`, `shopChanged`, `questStarted`, `questProgress`, `questCompleted`, `questAbandoned`, `accountChanged`, and `accountTransfer`.

`beforeTransaction`, `beforeTransfer`, `beforeAccountChange`, and `beforeAccountTransfer` are synchronous cancellable hooks. Set `event.cancel = true` and optionally `event.reason`.

## Virtual accounts and merchants

Use `Moneyz.accounts` for business/government/system balances. Player balances remain on the `Moneyz` scoreboard.

```js
Moneyz.accounts.create("business:commu_market", { name: "Commu Market", type: "business" });
Moneyz.accounts.deposit("business:commu_market", 500);
Moneyz.merchants.register({ id: "msv:commu_market", name: "Commu Market" });
Moneyz.merchants.charge("msv:commu_market", player, 25, { pack: "msv" });
```

## Extensions

### Moneyz main menu
```js
Moneyz.extensions.ui.registerMenuItem({
  id: "msv:properties",
  label: "Property Management",
  visible: player => player.hasTag("propertyOwner"),
  open: player => openProperties(player)
});
```

### Rewards
```js
Moneyz.extensions.rewards.registerType("msv:reputation", async (player, reward) => {
  // apply custom reward
  return true;
});
```

### Quests
Register declarative quests with `Moneyz.quests.registerQuest(definition)`. Custom objective systems can advance the active quest with `Moneyz.quests.progress(player, amount, { quest: "msv:deliver_mail" })`.

Shop providers, quest providers, and currencies also have namespaced registries under `Moneyz.extensions` for discovery by integrations.

## NPC custom menus

NPC behavior is no longer tied to the NPC name. Moneyz stores a `moneyz:menu` dynamic property on the NPC.

Built-in menu IDs include:

- `moneyz:menu`
- `moneyz:custom_shop`
- `moneyz:daily_rewards`
- `moneyz:lucky_purchase`
- `moneyz:blackjack`
- `moneyz:test_luck`
- `moneyz:craps`
- `moneyz:slots`
- `moneyz:quests`

Stand within 6 blocks of an NPC and run:

`/moneyz:npc moneyz:quests`

List IDs with `/moneyz:menus` and remove the assignment with `/moneyz:npc_clear`.

Other packs can register their own NPC destination:

```js
Moneyz.npcs.registerMenu("msv:properties", player => openProperties(player), { label: "Properties" });
```

Then `/moneyz:npc msv:properties` assigns the nearest NPC to it. Legacy name-based Moneyz NPC routing remains as a fallback for old worlds.

NPC dialogue/command buttons can also open a registered menu without assigning the NPC permanently:

`/scriptevent moneyz:menu/open moneyz:quests`

This works well with NPC dialogue because Bedrock ScriptEvents expose the dialogue initiator to script.

## Versioning

`Moneyz.apiVersion` is the SDK contract version. `Moneyz.version` is the platform version. Integrations should check `Moneyz.capabilities` instead of assuming a feature exists.

## Platform API 2.4 additions

Moneyz 2.4 adds `Moneyz.services` and `Moneyz.npcServices` as the preferred reusable routing layer. ATM, Send Moneyz, Help, Shop browser, specific shops, rewards/games, and protected admin screens can now be invoked consistently from NPCs, commands, ScriptEvents, and integrations. See `SERVICES_API.md` and `API_2_4_CHANGELOG.md`.

## Platform 2.6 additions

`Moneyz.products` provides persistent products, bundles, pets/entities, entitlement products, reservation products, custom delivery providers, and purchasing.

`Moneyz.entitlements` provides persistent player roles/permits/memberships with optional expiry and legacy-tag mirroring.

`Moneyz.exchanges` provides admin-configurable item/resource ↔ Moneyz exchanges.

`Moneyz.reservations` provides hotel room booking/check-out state with time-limited guest entitlements.

Built-in service IDs include `moneyz:products`, `moneyz:pets`, `moneyz:hotel`, `moneyz:admin/products`, `moneyz:admin/exchanges`, and `moneyz:admin/setup`.
