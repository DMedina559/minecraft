# Moneyz Economy v2.0

Moneyz Economy is a modern, full-featured economy, roleplay, and player transaction platform for **Minecraft Bedrock Edition** powered by the Bedrock Script API (`@minecraft/server` v2.10.0 and `@minecraft/server-ui` v2.2.0).

Moneyz powers player balances, dynamic shops, resource exchanges, player-to-player transfers, jobs and payroll, real estate, hotel room reservations, specialty products and pets, daily login rewards, quests, chance games, NPC terminals, world treasury liquidity, transaction ledgers, and developer API integrations.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Player Guide](#player-guide)
- [Admin Guide](#admin-guide)
- [Economy Modes & Treasury Engine](#economy-modes--treasury-engine)
- [Dynamic Shop Engine v3](#dynamic-shop-engine-v3)
- [ATM & Resource Exchanges](#atm--resource-exchanges)
- [Jobs and Payroll](#jobs-and-payroll)
- [Real Estate & Hotels](#real-estate--hotels)
- [Products, Bundles & Pets](#products-bundles--pets)
- [Daily Rewards & Quests](#daily-rewards--quests)
- [Lucky Purchases & Chance Games](#lucky-purchases--chance-games)
- [Commands Reference](#commands-reference)
- [NPC Services Setup](#npc-services-setup)
- [Developer SDK & Cross-Pack Integrations](#developer-sdk--cross-pack-integrations)
- [Diagnostics & Troubleshooting](#diagnostics--troubleshooting)

---

## Quick Start

### 1. Enable the Behavior Pack

Add Moneyz Economy to your Minecraft Bedrock world. Moneyz v2.0 uses the Bedrock Script API declared by the pack manifest (`@minecraft/server` v2.10.0 and `@minecraft/server-ui` v2.2.0).

### 2. Initialize the World

As a world operator/owner, execute:

```mcfunction
/moneyz:setup
```

The setup command is idempotent and initializes the world economy:

- Creates the authoritative `Moneyz` scoreboard objective if missing;
- Initializes all online player balances;
- Grants the caller the `moneyzAdmin` administrator tag;
- Grants the Moneyz Menu item (`zvortex:moneyz_menu`);
- Grants an NPC spawn egg where supported.

### 3. Open Moneyz

Players can open the main interface using the Moneyz Menu item or chat command:

```mcfunction
/moneyz:menu
```

Admins can open the administrative control panel with:

```mcfunction
/moneyz:admin
```

The in-game comprehensive user guide is accessible anytime via:

```mcfunction
/moneyz:help
```

---

## Player Guide

### Moneyz Balance

Moneyz uses the `Moneyz` scoreboard objective as the player currency balance. View your balance in the Moneyz Menu, via the in-game action bar/HUD displays, or with:

```mcfunction
/moneyz:balance
```

### Main Menu Access

Holding and using the Moneyz Menu item (`zvortex:moneyz_menu`) opens the central hub:

- **Shops** — Browse dynamic shop categories and listings with live prices.
- **ATM / Exchange** — Convert valuable resources into Moneyz or buy resources with Moneyz.
- **Send Moneyz** — Direct player-to-player funds transfers.
- **Jobs & Employment** — Apply for jobs, view employment status, or run banker payroll.
- **Real Estate & Hotels** — Rent or buy houses, pay recurring rent, or book hotel room stays.
- **Products & Pet Shop** — Purchase item bundles, pets, entitlements, and specialty products.
- **Quests & Daily Rewards** — Claim daily login bonuses and complete mining, farming, and slaying quests.
- **Feeling Lucky & Chance Games** — Play Lucky Purchase, Blackjack, Craps, Slots, and Test Your Luck.

---

## Admin Guide

Access requires operator permission or the `moneyzAdmin` tag. Access the central dashboard via `/moneyz:admin`.

### Key Admin Systems

- **Setup Wizard** — Step-by-step diagnostic and world setup checklist.
- **Balance Manager** — Add, remove, or set Moneyz balances for online players.
- **Player Tag & Property Manager** — Toggle individual per-player feature flags (`moneyzShop`, `moneyzATM`, `moneyzSend`, `moneyzDaily`, `moneyzQuest`, `moneyzLucky`, `moneyzChance`).
- **Economy Treasury & Reserves** — Choose world economy modes, deposit/withdraw liquidity, and manage ATM item reserve backing.
- **Shop Manager** — Create and edit dynamic shop categories, item listings, bundle amounts, prices, and stock limits in real time.
- **Job Manager** — Edit job definitions, salaries, titles, and application requirements.
- **Property / Hotel Manager** — Register and configure map-specific house rentals and hotel rooms.
- **Exchange Manager** — Configure ATM resource exchange rates.
- **Product Manager** — Configure specialty products, bundles, pets, and entitlements.
- **Settings** — Global configuration toggles, daily reward amounts, game win chance percentages, payout multipliers, and logging levels.
- **Transaction Ledger** — Inspect recent transaction activity across all players.
- **Diagnostics** — Health status of Script API components, scoreboards, and storage.

---

## Economy Modes & Treasury Engine

Moneyz 2.0 supports three flexible economy modes (configured in **Moneyz Admin → Economy Treasury**):

| Economy Mode | Description |
|---|---|
| **Classic Mode** | Infinite system liquidity. Shop payouts, rewards, jobs, and quests pay from unlimited funds. |
| **Treasury Mode** | System payouts draw from liquid capital in the World Treasury. Player shop purchases, rent, hotel bookings, and game stakes return Moneyz back to the Treasury. |
| **Reserve Economy** | Combines Treasury Mode rules with physical ATM resource reserves. Depositing items at the ATM creates reserve assets, and withdrawing resources requires active physical stock. |

### Insolvency Safety

In Treasury and Reserve modes, if liquid capital or physical item reserves run out, transactions fail safely without taking player funds or items.

---

## Dynamic Shop Engine v3

Shop Engine v3 operates entirely on dynamic Script API logic without legacy JSON or function bloat.

### Features

- **Live Pricing** — Dynamic buy and sell pricing with custom bundle multipliers.
- **Stock Tracking** — Support for unlimited stock and tracked finite stock (listings sell out as items are bought).
- **In-Game Custom Shops** — World owners can create custom shop categories and listings directly in-game via **Moneyz Admin → Manage Shops**.

---

## ATM & Resource Exchanges

Convert valuable ores and ingots directly for Moneyz (or convert Moneyz back into items):

| Resource Item | Exchange Rate |
|---|---:|
| Netherite Ingot | 1,000 Moneyz |
| Emerald | 100 Moneyz |
| Diamond | 75 Moneyz |
| Iron Ingot | 50 Moneyz |
| Gold Ingot | 25 Moneyz |
| Copper Ingot | 10 Moneyz |
| Coal | 5 Moneyz |

Admins can modify or create custom exchange definitions in **Moneyz Admin → Exchange Manager**.

---

## Jobs and Payroll

### Applying for Jobs

Open the Jobs UI via the Moneyz Menu or run:

```mcfunction
/moneyz:jobs
/moneyz:job_apply
/moneyz:job <jobId>
```

Resign from a job anytime with:

```mcfunction
/moneyz:job_quit
```

### Built-in Jobs

Assistant, Banker, Builder, Cop, Delivery Person, Farmer, Fisher, Hotel Owner, Judge, Lawyer, Mayor, Pastor, Realtor.

### Banker Payroll

Employed Bankers can execute server-wide worker payouts using:

```mcfunction
/moneyz:pay
```

---

## Real Estate & Hotels

### Property Platform

Properties start blank by default so world owners can create listings suited to their specific map builds.

- **Types** — Residential houses, commercial shopfronts, and custom estates.
- **Rentals & Sales** — Purchase outright or pay recurring rent (default rent interval: 7 Minecraft days).
- **Access Management** — Property owners can grant guest access or assign manager roles.

### Hotel Engine

Book short-term hotel room stays with automatic occupancy and checkout tracking. Access via `/moneyz:hotel`.

---

## Products, Bundles & Pets

The Product system handles specialty purchases beyond standard shop listings:

- Item bundles, pets, entitlements, and custom service deliverables.
- **Delivery Protection** — Automatically refunds the player if delivery fails (e.g., inventory full).
- Access via Pet Shop (`/moneyz:pets`) or Products (`/moneyz:products`).

---

## Daily Rewards & Quests

### Daily Login Rewards

Claim a daily Moneyz reward bonus once every 24 hours (UTC reset). Default reward: **25 Moneyz**.

### Quest Engine v2

- **Objectives** — Mining ores, harvesting crops, slaying hostile mobs, slaughtering farm animals, location patrols, and balance retention goals.
- **Peaceful Compatibility** — Hostile mob quests are automatically filtered out on Peaceful difficulty.
- **Progress Payouts** — Step-by-step progress payouts plus a completion bonus. Quests can be abandoned safely at any time.

---

## Lucky Purchases & Chance Games

### Lucky Purchase

Pay a fixed fee to draw a randomized item live from the current Shop catalog. Respects live shop stock and includes automatic refund protection.

### Chance Games

- **21 / Blackjack** — Complete Blackjack rules with Hit, Stand, Natural 21, Dealer AI, and Tie handling.
- **Dice / Craps** — Pass-line Craps rules (Come-out 7/11 win, 2/3/12 craps out, point establishment).
- **Slots** — Weighted 3-reel slot machine with customizable symbol payouts.
- **Test Your Luck** — Direct probability roll against world-configured win percentage.

---

## Commands Reference

### Player Commands

```text
/moneyz:menu               - Open main Moneyz Menu
/moneyz:balance [player]   - View player balance
/moneyz:help               - Open comprehensive in-game guide
/moneyz:open <serviceId>   - Open specific Moneyz service
/moneyz:services           - List registered API service IDs
/moneyz:jobs               - Open employment UI
/moneyz:job_apply          - Apply for job permit
/moneyz:job <jobId>        - Accept job position
/moneyz:job_quit           - Resign from current job
/moneyz:pay                - Run worker payroll (Bankers)
/moneyz:send               - Send Moneyz to online player
/moneyz:realtor            - Open real estate market
/moneyz:hotel              - Open hotel room bookings
/moneyz:pets               - Open pet shop catalog
/moneyz:products           - Open specialty products UI
```

### Admin Commands

```text
/moneyz:setup              - Initialize world economy & scoreboard
/moneyz:admin              - Open central Admin Dashboard
/moneyz:give <p> <amt>     - Add Moneyz to player balance
/moneyz:take <p> <amt>     - Deduct Moneyz from player balance
/moneyz:set <p> <amt>      - Set player balance directly
/moneyz:reload             - Reload shops and configuration
/moneyz:health             - Run system health diagnostics
/moneyz:validate           - Validate system state & files
/moneyz:transactions [cnt] - View recent transaction ledger
/moneyz:npc <serviceId>    - Bind service to targeted NPC
/moneyz:npc_shop <shopId>  - Bind shop to targeted NPC
/moneyz:npc_clear          - Clear service bindings from NPC
/moneyz:npc_shop_clear     - Clear shop bindings from NPC
```

---

## NPC Services Setup

Moneyz 2.0 uses a service-driven NPC system:

1. Spawn or stand near a Minecraft NPC.
2. Bind a service using:

```mcfunction
/moneyz:npc moneyz:atm
```

3. Or bind a specific shop:

```mcfunction
/moneyz:npc_shop general
```

Binding multiple services to a single NPC automatically displays an interactive service chooser menu when interacted with!

---

## Developer SDK & Cross-Pack Integrations

### Global SDK Namespace (`Moneyz.*`)

Import from `scripts/api/public.js`:

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Check balance
const balance = Moneyz.economy.getBalance(player);

// Register custom menu item in Moneyz Menu
Moneyz.ui.registerMenuItem({
    id: "my_addon:custom_menu",
    label: "Custom Addon Menu",
    category: "general",
    open: (player) => openCustomAddonForm(player)
});
```

### Cross-Pack ScriptEvents API

Other behavior packs can communicate with Moneyz asynchronously via `ScriptEvents`:

- **Gateway Event**: `moneyz:api/request`
- **Request Format**: `{"requestId": "req1", "op": "economy.balance", "player": "Steve"}`
- **Response Event**: `moneyz:api:response/<requestId>`

---

## Diagnostics & Troubleshooting

### Diagnostic Commands

Execute `/moneyz:health` or `/moneyz:validate` in chat to verify system status, loaded shops, transaction ledger state, and dynamic property sync.

### Transaction Ledger

Moneyz maintains a bounded operational ledger (150 recent entries) tracking all transfers, sales, purchases, rewards, refunds, game stakes, and admin adjustments. Viewable via `/moneyz:transactions` or **Moneyz Admin → Transaction Ledger**.

---

## Credits & License

Moneyz Economy was created by **ZVortex11325 / DMedina559**.
