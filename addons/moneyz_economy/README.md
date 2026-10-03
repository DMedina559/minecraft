# Moneyz Economy 2.0

Moneyz Economy is a modern economy and roleplay platform for **Minecraft Bedrock Edition**. Version 2.0 moves the pack's core systems from legacy function/dialogue-driven behavior to the Bedrock Script API while keeping compatibility paths for existing Moneyz worlds.

Moneyz can power player balances, dynamic shops, resource exchanges, player-to-player transfers, jobs and payroll, real estate, hotels, products and pets, daily rewards, quests, chance games, NPC terminals, transactions, and integrations with other behavior packs.

> **2.0 status:** this branch is the 2.0 release candidate. The latest previously released public build is 1.10.1. Test upgrades on a copy of an existing world before replacing a production pack.

## Contents

- [Quick start](#quick-start)
- [Player guide](#player-guide)
- [Admin guide](#admin-guide)
- [Dynamic shops](#dynamic-shops)
- [NPC services](#npc-services)
- [Jobs and payroll](#jobs-and-payroll)
- [Real estate and hotels](#real-estate-and-hotels)
- [Rewards, quests and games](#rewards-quests-and-games)
- [Commands](#commands)
- [Public API and integrations](#public-api-and-integrations)
- [Legacy compatibility and migration](#legacy-compatibility-and-migration)
- [Troubleshooting](#troubleshooting)
- [Development and testing](#development-and-testing)

## Quick start

### 1. Enable the behavior pack

Enable Moneyz Economy on the world. Moneyz 2.0 uses the Bedrock Script API and the `@minecraft/server` / `@minecraft/server-ui` modules declared by the pack manifest.

### 2. Initialize the world

As a world owner/operator, run:

```mcfunction
/moneyz:setup
```

The setup command is idempotent and is the scripted equivalent of the legacy `function setup` workflow. It:

- creates the `Moneyz` scoreboard objective if it does not exist;
- initializes online players in that objective;
- grants the caller the `moneyzAdmin` compatibility/admin tag;
- grants the Moneyz Menu item (`zvortex:moneyz_menu`);
- grants an NPC spawn egg where supported.

Running setup again should not destroy balances or recreate an existing objective.

### 3. Open Moneyz

Players can open the main UI with the Moneyz Menu item or:

```mcfunction
/moneyz:menu
```

Admins can open the management UI with:

```mcfunction
/moneyz:admin
```

The built-in in-game guide is available with:

```mcfunction
/moneyz:help
```

### 4. Configure your world

Moneyz intentionally leaves **world-specific real estate blank**. Use the Admin Menu to configure the shops, properties, hotels, products, exchanges, jobs and NPC services that make sense for your map.

## Player guide

### Moneyz balance

Moneyz uses the `Moneyz` scoreboard objective as the player currency balance. The main menu shows the current balance, and players can query it with:

```mcfunction
/moneyz:balance
```

Moneyz's economy service validates deposits, withdrawals and transfers and records supported activity in the transaction ledger.

### Shops

Moneyz 2.0 uses **Shop Engine v3** for modern shops. Shops are runtime Script API definitions rather than giant generated buy/sell function trees.

A shop can define:

- any valid Minecraft item/block type ID that can be handled as an inventory item;
- separate buy and sell prices;
- buy/sell bundle quantities;
- categories;
- unlimited or tracked stock;
- browser visibility;
- whether the shop can be attached to NPCs.

Players can browse exposed shops from the Moneyz Menu. A world owner can also make an NPC expose only one particular shop.

### ATM and exchanges

The ATM is backed by the configurable Exchange Engine. An exchange defines a resource, quantity and Moneyz value. Players can exchange through the ATM UI without legacy buy/sell functions.

Existing legacy exchange values are preserved as compatibility defaults where applicable, but admins can manage exchange definitions for their world.

### Sending Moneyz

The Send Moneyz UI transfers Moneyz directly between online players. The transfer is rejected when the amount is invalid or the sender cannot afford it.

### Jobs

Open the employment UI with the Moneyz Menu or:

```mcfunction
/moneyz:jobs
```

Most built-in jobs require an application permit. The command flow is:

```mcfunction
/moneyz:job_apply
/moneyz:job farmer
```

Leave a job with:

```mcfunction
/moneyz:job_quit
```

The built-in legacy-compatible roster currently includes Assistant, Banker, Builder, Cop, Delivery Person, Farmer, Fisher, Hotel Owner, Judge, Lawyer, Mayor, Pastor and Realtor. Job definitions and pay can be changed by admins.

Bankers can run payroll for currently employed online players:

```mcfunction
/moneyz:pay
```

Legacy job tags are mirrored/migrated where supported so older worlds can move to the modern Jobs engine.

### Real estate

Moneyz 2.0 has a native property engine for residential, commercial and hotel listings. Players can buy, sell, rent and check out according to the listing type and state.

A property cannot be purchased/rented by another player while it is occupied. Rent intervals and prices are configured per listing.

**No generic houses are preconfigured for a new world.** Property locations and values are map-specific, so the world owner creates them.

### Hotels

Hotels use the property/reservation systems for room-style temporary occupancy. Moneyz tracks active reservations and rejects conflicting/double bookings.

### Products, bundles and pets

The Product system supports configurable purchases beyond ordinary shop listings. Products can represent items, bundles, pets, entitlements or other registered delivery behavior. Failed delivery paths are designed to avoid silently consuming a player's Moneyz.

### Daily rewards

When enabled, players can claim a configurable daily Moneyz reward once per UTC date. The default configured reward is `25` Moneyz unless changed by the world owner.

### Quests

The Quest engine includes objectives for:

- mining configured ores;
- planting crops;
- slaying hostile mobs;
- slaughtering farm animals;
- patrolling/covering a required area;
- maintaining a Moneyz balance for a required duration.

Quest rewards are defined in Moneyz's quest data. Hostile-mob quests should not be selected/used when the world difficulty prevents hostile mobs from existing (for example Peaceful).

### Lucky Purchase and chance games

The Feeling Lucky section can expose:

- Lucky Purchase;
- Test Your Luck;
- 21 / Blackjack;
- Dice / Craps;
- Slots.

Admins control whether Lucky Purchase and Chance Games are enabled, whether Lucky Purchase is once per day, the chance multiplier, and the configured win chance used by applicable games.

## Admin guide

The Moneyz Admin menu is the central configuration interface. Access requires Moneyz admin permission; `/moneyz:setup` grants the setup player the `moneyzAdmin` compatibility tag.

Current admin areas include:

- **Balance Manager** — add, set or remove Moneyz for online players.
- **Properties / Tags** — inspect compatibility state and player tags.
- **Shop Manager** — create/edit dynamic shops and listings.
- **NPC Manager** — assign services and specific shops to NPCs.
- **Job Manager** — manage job definitions and pay.
- **Property / Hotel Manager** — define world-specific real estate.
- **Exchange Manager** — configure ATM/resource exchanges.
- **Product Manager** — configure products, bundles, pets and service-like purchases.
- **Setup Wizard** — inspect world setup and jump to major configuration systems.
- **Settings** — global feature switches and reward/chance settings.
- **Transaction Ledger** — inspect recent transaction activity.
- **Diagnostics** — runtime health information.

### Feature settings

Moneyz currently maintains compatibility settings for:

| Setting | Default | Purpose |
|---|---:|---|
| `dailyReward` | `25` | Daily Moneyz reward |
| `chanceX` | `2` | Chance-game multiplier |
| `chanceWin` | `50` | Applicable chance-game win percentage |
| `syncPlayers` | `true` | Sync feature flags to players |
| `moneyzATM` | `true` | ATM availability |
| `moneyzQuest` | `true` | Quest availability |
| `moneyzSend` | `true` | Player transfers |
| `moneyzShop` | `true` | Shop browser |
| `moneyzDaily` | `true` | Daily rewards |
| `moneyzLucky` | `true` | Lucky Purchase area |
| `moneyzChance` | `true` | Chance games |
| `oneLuckyPurchase` | `true` | Once-per-day Lucky Purchase behavior |

When `syncPlayers` is enabled, feature flags are mirrored to player dynamic properties for compatibility and per-player UI behavior.

### Transaction ledger

Moneyz records recent economy activity for administration and diagnostics. The ledger is intentionally bounded (currently 150 records), so it should be treated as a recent operational ledger, **not an unlimited accounting database**.

## Dynamic shops

### Creating a shop

Use **Moneyz Admin → Manage Shops**. A modern shop has an ID, display name, settings and listings.

Use stable, simple IDs such as:

```text
general
armory
farmers_market
mountainside_market
```

IDs are used by NPC bindings and APIs, so avoid changing them after other systems depend on them.

### Listings

Listings can define an item/block type ID, category, buy configuration, sell configuration and stock. This allows a block item such as `minecraft:stone` to be sold the same way as other inventory items; the engine operates on item stacks/type IDs rather than requiring separate legacy block functions.

Prices should be designed around your world's scarcity, renewable resources, progression and intended Moneyz sinks/sources. Avoid a sell price that allows an easy crafting loop to generate unlimited profit unless that is intentional.

### Stock

Shops may use unlimited stock or tracked quantities. A tracked listing can sell out. Buying and selling update stock according to the listing configuration.

## NPC services

Moneyz 2.0 NPCs are service-driven. **NPC names are no longer the primary routing mechanism.** An NPC can store one or more Moneyz services and/or specific shop bindings.

### Recommended: NPC Manager

1. Spawn/place a Minecraft NPC.
2. Open **Moneyz Admin → Manage NPC Services**.
3. Select the NPC.
4. Add the service(s) or shop(s) that NPC should expose.
5. Interact with the NPC as a normal player.

If the NPC has one Moneyz service, it opens directly. If it has multiple services, Moneyz displays a chooser.

### Command setup

Stand near an NPC and run:

```mcfunction
/moneyz:npc moneyz:atm
```

Bind a particular shop:

```mcfunction
/moneyz:npc_shop general
```

Discover IDs:

```mcfunction
/moneyz:services
/moneyz:shops
/moneyz:menus
```

Clear bindings:

```mcfunction
/moneyz:npc_shop_clear
/moneyz:npc_clear
```

The NPC commands can also accept selectors where supported. Without one, Moneyz uses the nearest NPC for the player-oriented setup commands.

### Built-in service IDs

Common service IDs include:

| Service ID | Purpose |
|---|---|
| `moneyz:menu` | Main Moneyz menu |
| `moneyz:help` | In-game guide |
| `moneyz:shops` | All exposed shops |
| `moneyz:shop` | Specific shop service (normally supplied a shop ID) |
| `moneyz:atm` | ATM / exchanges |
| `moneyz:send` | Send Moneyz |
| `moneyz:jobs` | Employment |
| `moneyz:payroll` | Banker payroll |
| `moneyz:realtor` | Real estate |
| `moneyz:hotel` | Hotel services |
| `moneyz:pets` | Pet products |
| `moneyz:products` | Products/services |
| `moneyz:daily_rewards` | Daily reward |
| `moneyz:quests` | Quests |
| `moneyz:lucky` | Feeling Lucky |
| `moneyz:lucky_purchase` | Lucky Purchase |
| `moneyz:blackjack` | 21 / Blackjack |
| `moneyz:test_luck` | Test Your Luck |
| `moneyz:craps` | Dice / Craps |
| `moneyz:slots` | Slots |
| `moneyz:admin` | Admin menu (permission checked) |

Additional `moneyz:admin/...` services expose individual admin screens. Use `/moneyz:services` for the runtime-authoritative list.

## Jobs and payroll

Job definitions are stored by the modern Jobs engine. Definitions include an ID, name, pay, application requirement and optional legacy tags.

Built-in compatibility pay values currently seed as:

| Job | Pay |
|---|---:|
| Assistant | 2,000 |
| Banker | 4,000 |
| Builder | 2,000 |
| Cop | 2,000 |
| Delivery Person | 1,000 |
| Farmer | 1,000 |
| Fisher | 1,000 |
| Hotel Owner | 1,000 |
| Judge | 4,000 |
| Lawyer | 3,000 |
| Mayor | 4,000 |
| Pastor | 3,000 |
| Realtor | 3,000 |

Admins can change job definitions, so these are defaults rather than a promise that every Moneyz world uses the same economy.

## Real estate and hotels

The property database starts empty by design. Admins create listings that fit the actual world's builds and locations.

Property types supported by the core engine are:

- `residential`
- `commercial`
- `hotel`

Definitions can include purchase price, rent, rent interval and other metadata used by the UI/integrations. Ownership and tenancy are stored by Moneyz rather than relying solely on tags.

## Rewards, quests and games

Moneyz's reward service can grant Moneyz, experience, items and extension-defined reward types. The quest engine uses this infrastructure for modern rewards.

Current quest families include hostile mob kills, farm animal kills, crop planting, ore mining, patrol distance/area and maintained-balance objectives. Quest definitions are data-driven in `scripts/quest/definitions.js`.

## Commands

Use the **full namespaced commands**. Other behavior packs can register aliases such as `help`, `give` or `reload`; an alias warning does not remove `/moneyz:help`, `/moneyz:give` or `/moneyz:reload`.

### Player-facing

```text
/moneyz:menu
/moneyz:balance [player]
/moneyz:help
/moneyz:open <service>
/moneyz:services
/moneyz:jobs
/moneyz:job_apply
/moneyz:job <jobId>
/moneyz:job_quit
/moneyz:pay
/moneyz:realtor
/moneyz:hotel
/moneyz:pets
/moneyz:products
```

### Administration / world creation

```text
/moneyz:setup
/moneyz:admin
/moneyz:give <player> <amount>
/moneyz:take <player> <amount>
/moneyz:set <player> <amount>
/moneyz:reload
/moneyz:health
/moneyz:migrate
/moneyz:transactions [count]
/moneyz:npc <service> [npc]
/moneyz:npc_shop <shopId> [npc]
/moneyz:npc_shop_clear
/moneyz:npc_clear
/moneyz:shops
/moneyz:menus
/moneyz:api
/moneyz:extensions
/moneyz:validate
```

Permissions are enforced by the command registration and by sensitive services themselves.

## Public API and integrations

Moneyz 2.0 is designed as a platform other scripts can build on.

### SDK

The canonical SDK surface is exported from:

```js
scripts/api/public.js
```

It re-exports the Moneyz platform object from `core/api.js`.

Current platform identifiers:

```text
Moneyz platform: 2.0.0-rc.1
Public API:       2.6.0
```

Major SDK namespaces include:

```text
Moneyz.economy
Moneyz.transactions
Moneyz.accounts
Moneyz.merchants
Moneyz.players
Moneyz.shops
Moneyz.commerce
Moneyz.quests
Moneyz.rewards
Moneyz.jobs
Moneyz.properties
Moneyz.products
Moneyz.entitlements
Moneyz.exchanges
Moneyz.reservations
Moneyz.services
Moneyz.npcServices
Moneyz.npcShops
Moneyz.extensions
Moneyz.events
Moneyz.storage
Moneyz.permissions
Moneyz.policies
Moneyz.audit
Moneyz.metrics
Moneyz.pricing
Moneyz.fees
Moneyz.notifications
Moneyz.scheduler
Moneyz.escrow
Moneyz.invoices
Moneyz.terminals
Moneyz.components
```

Use `Moneyz.capabilities` rather than assuming a subsystem exists forever. `/moneyz:api` reports the runtime API version and enabled capability flags.

### Same-pack/module integrations

Code bundled into the same behavior-pack module graph can import the public module and use the SDK directly. Prefer the public module instead of importing Moneyz internals.

```js
import { Moneyz } from "./scripts/api/public.js";

const balance = Moneyz.economy.getBalance(player);
Moneyz.events.on("serviceOpened", event => {
  // integration logic
});
```

Adjust the relative path for where your module lives.

### Separate behavior packs

JavaScript module exports are not a general cross-behavior-pack module loader. Separate packs should use Moneyz's external integration surfaces rather than assuming they can `import` Moneyz's internal files.

The primary ScriptEvent gateway is:

```text
moneyz:api/request
```

Requests use JSON. Example shape:

```json
{
  "requestId": "my_pack_001",
  "op": "economy.balance",
  "player": "Steve"
}
```

Moneyz emits a response ScriptEvent named:

```text
moneyz:api:response/<requestId>
```

The gateway currently exposes operations for health/capabilities-style discovery, economy, transaction counts, virtual accounts, jobs, entitlements, shops, commerce, products, properties, exchanges, reservations, quests and service discovery. See `scripts/api/gateway.js` for the runtime-authoritative operation list and response fields.

> **Important:** player resolution and ScriptEvent source semantics depend on how the event is issued. Integrations should handle structured failures such as `player_not_found`, `target_not_found`, `unknown_operation`, `insufficient_funds`, and subsystem-specific errors instead of assuming success.

### Service opening ScriptEvents

Moneyz also recognizes integration events including:

```text
moneyz:service/open
moneyz:menu/open
moneyz:shop/open
moneyz:job/apply
moneyz:job/join
moneyz:job/quit
moneyz:reload
moneyz:shop/reload
moneyz:health
moneyz:migrate
moneyz:npc/assign
```

Use namespaced IDs for your own extensions and service registrations.

### Extension architecture

Moneyz includes extension registries for UI, shops, quests, rewards, currencies and related platform capabilities. Third-party integrations should prefer stable public registries and capability checks over reaching into GUI or storage internals.

## Legacy compatibility and migration

Moneyz 2.0 retains legacy content where practical so existing worlds are not forced into a one-step rewrite.

Compatibility includes legacy dialogues/functions, legacy job tags, old NPC menu/shop bindings, and existing feature properties. Modern systems should be preferred for new content.

Useful maintenance commands:

```mcfunction
/moneyz:migrate
/moneyz:reload
/moneyz:validate
/moneyz:health
```

### Dialogue vs modern services

Older Moneyz versions relied heavily on NPC dialogue commands such as `dialogue open ...` and generated functions. Those files remain useful for compatibility, but **new 2.0 worlds should prefer Moneyz Services, dynamic shops and NPC bindings**. This allows one NPC to expose multiple services and avoids manually maintaining commands for every item.

## Troubleshooting

### `/moneyz:setup` says the service is unavailable

Current 2.0 builds implement `/moneyz:setup` directly through the setup engine; it should not depend on opening an admin service. Make sure an older Moneyz build is not still enabled/cached in the world.

### A feature is missing from the main menu

Check **Admin → Settings**. Moneyz can independently enable/disable Shops, ATM, Send, Quests, Daily Rewards, Lucky Purchase and Chance Games. With player syncing enabled, those settings are mirrored to player properties.

### An NPC does nothing

Use **Admin → Manage NPC Services** and verify the NPC has a valid service/shop. You can also clear and rebuild its Moneyz bindings with `/moneyz:npc_clear`.

### A purchase fails

Check:

1. player Moneyz balance;
2. listing buy/sell price and bundle amount;
3. inventory capacity;
4. tracked stock;
5. shop/listing availability and permissions.

### Command alias warnings

Warnings such as `alias [help] already in use` mean another pack claimed a short alias. Use the full command (`/moneyz:help`, `/moneyz:reload`, `/moneyz:give`, etc.).

### Diagnostics

Run:

```mcfunction
/moneyz:health
/moneyz:validate
```

When reporting a problem, include the Moneyz version, Minecraft Bedrock version, reproduction steps, other enabled behavior packs, and relevant Content Log entries.

## Development and testing

Moneyz 2.0 has a separate developer GameTest build. The comprehensive internal suite directly exercises production APIs with GameTest `SimulatedPlayer` objects instead of trying to move player objects across behavior-pack boundaries.

The current suite covers economy operations and atomicity, transactions, accounts, jobs/migration, entitlements, shops/commerce/stock, products/refunds, properties, hotels/reservations, exchanges, quests, services, setup behavior and stress cases.

Run the full internal suite in the developer test build with:

```mcfunction
/gametest runset moneyz_internal
```

The production pack does **not** require the GameTest dependency.

## Legacy download / project links

- Public/legacy release page: https://mcpedl.com/moneyz-economy/
- Source repository: https://github.com/DMedina559/minecraft
- Historical item/price sheet: https://docs.google.com/spreadsheets/d/1TG4Ol5z_8U7mEJlSLx4I2LBmPVcJ0Aawu3_o_ac4xvU

## Credits

Moneyz Economy was created by **ZVortex11325 / DMedina559**.

The original project also credited **SoullessReaperYT** for a custom-menu video/template that helped earlier Moneyz UI development.
