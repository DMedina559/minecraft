# Moneyz Economy Public Platform API Reference (v2.0)

This document provides a comprehensive reference and usage guide for integrating with the **Moneyz Economy Public API**.

Behavior packs, addons, and server scripts should import the public facade from `scripts/api/public.js`. Do not import or modify Moneyz internal storage modules directly.

---

## Table of Contents

1. [Importing the SDK & Capability Discovery](#1-importing-the-sdk--capability-discovery)
2. [Core Economy Operations](#2-core-economy-operations)
3. [World Treasury Engine & Resource Reserves](#3-world-treasury-engine--resource-reserves)
4. [Dynamic Shop Engine v3 & Commerce](#4-dynamic-shop-engine-v3--commerce)
5. [Jobs, Employment & Worker Payroll](#5-jobs-employment--worker-payroll)
6. [Real Estate Platform & Rentals](#6-real-estate-platform--rentals)
7. [Hotel Engine & Room Reservations](#7-hotel-engine--room-reservations)
8. [Products, Entitlements & Pets](#8-products-entitlements--pets)
9. [Quest Engine v2 & Daily Rewards](#9-quest-engine-v2--daily-rewards)
10. [Virtual Accounts & Merchants](#10-virtual-accounts--merchants)
11. [UI Extensions (Main Menu Buttons)](#11-ui-extensions-main-menu-buttons)
12. [Services & NPC Bindings](#12-services--npc-bindings)
13. [Event Bus & Cancellable Hooks](#13-event-bus--cancellable-hooks)
14. [Cross-Pack ScriptEvents Gateway](#14-cross-pack-scriptevents-gateway)
15. [Pricing & Fee Calculators](#15-pricing--fee-calculators)
16. [Audit Ledger & System Observability](#16-audit-ledger--system-observability)

---

## 1. Importing the SDK & Capability Discovery

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Check SDK versions
console.warn(`Moneyz Public API Version: ${Moneyz.apiVersion}`); // e.g. "2.0.0"
console.warn(`Moneyz Platform Version: ${Moneyz.version}`);

// Capability Discovery (Check enabled subsystems)
if (Moneyz.capabilities.quests) {
    console.warn("Moneyz Quest Engine is active.");
}

if (Moneyz.capabilities.treasury) {
    console.warn("Moneyz Treasury Engine is active.");
}

if (Moneyz.capabilities.products) {
    console.warn("Moneyz Product & Entitlement Engine is active.");
}
```

---

## 2. Core Economy Operations

All player balance operations interface with the authoritative `Moneyz` scoreboard objective and emit audit records to the Transaction Ledger.

### Methods

- `Moneyz.getBalance(player)`: Returns integer balance for player.
- `Moneyz.canAfford(player, amount)`: Returns `true` if player has at least `amount` Moneyz.
- `Moneyz.deposit(player, amount, metadata)`: Adds Moneyz to player balance.
- `Moneyz.withdraw(player, amount, metadata)`: Deducts Moneyz from player balance (returns `boolean` success).
- `Moneyz.setBalance(player, amount, metadata)`: Sets player balance directly.
- `Moneyz.transfer(sender, recipient, amount, metadata)`: Safely transfers Moneyz between two players.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Deposit funds with metadata for transaction auditing
function grantQuestReward(player) {
    const rewardAmount = 250;
    
    const success = Moneyz.deposit(player, rewardAmount, {
        source: "my_pack:dragon_quest",
        pack: "my_custom_addon",
        description: "Defeated Ender Dragon"
    });

    if (success) {
        player.sendMessage(`§aReceived §g${rewardAmount} Moneyz§a! New Balance: §g${Moneyz.getBalance(player)} Moneyz`);
    }
}

// Safely deduct money for a custom purchase
function processPurchase(player, itemCost) {
    if (!Moneyz.canAfford(player, itemCost)) {
        player.sendMessage("§cYou cannot afford this purchase!");
        return false;
    }

    const success = Moneyz.withdraw(player, itemCost, {
        source: "my_pack:custom_vendor",
        description: "Purchased Enchanted Sword"
    });

    if (success) {
        player.sendMessage("§aPurchase successful!");
    }
    return success;
}

// Direct player transfer
function payPlayer(sender, recipient, amount) {
    const result = Moneyz.transfer(sender, recipient, amount, {
        source: "my_pack:player_trade",
        description: "Item trade payment"
    });

    if (result.ok) {
        sender.sendMessage(`§aSent ${amount} Moneyz to ${recipient.nameTag}`);
        recipient.sendMessage(`§aReceived ${amount} Moneyz from ${sender.nameTag}`);
    } else {
        sender.sendMessage(`§cTransfer failed: ${result.reason}`);
    }
}
```

---

## 3. World Treasury Engine & Resource Reserves

The Treasury Engine manages world-level liquidity and physical ATM resource backing.

### Methods & Properties

- `Moneyz.treasury.getMode()`: Returns economy mode (`"classic"`, `"treasury"`, or `"reserve"`).
- `Moneyz.treasury.setMode(mode)`: Sets economy mode.
- `Moneyz.treasury.getLiquidBalance()`: Returns available liquid Treasury Moneyz.
- `Moneyz.treasury.deposit(amount)`: Adds funds to Treasury.
- `Moneyz.treasury.withdraw(amount)`: Deducts funds from Treasury.
- `Moneyz.treasury.getReserveStock(itemId)`: Gets active physical ATM reserve count for item.
- `Moneyz.treasury.setReserveStock(itemId, quantity)`: Sets ATM reserve stock.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Check Treasury Mode & Capital
const mode = Moneyz.treasury.getMode(); // "treasury"
const treasuryBalance = Moneyz.treasury.getLiquidBalance();

console.warn(`World Economy Mode: ${mode}, Treasury Liquidity: ${treasuryBalance} Moneyz`);

// Deposit proceeds into World Treasury
Moneyz.treasury.deposit(1000);

// Check diamond reserve stock in Reserve Economy mode
const diamondStock = Moneyz.treasury.getReserveStock("minecraft:diamond");
console.warn(`ATM Diamond Reserve Stock: ${diamondStock}`);
```

---

## 4. Dynamic Shop Engine v3 & Commerce

Shop Engine v3 allows runtime creation and management of shops, categories, listings, live stock, and commerce execution.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

// 1. Create a dynamic custom shop
Moneyz.shops.createShop({
    id: "my_pack:blacksmith",
    name: "Blacksmith Armory",
    enabled: true,
    settings: { allowNpcBinding: true, allowDirectAccess: true }
});

// 2. Add an item listing with tracked stock
Moneyz.shops.addListing("my_pack:blacksmith", {
    id: "diamond_sword_listing",
    typeId: "minecraft:diamond_sword",
    name: "Diamond Sword",
    category: "weapons",
    buy: { enabled: true, price: 500, amount: 1 },
    sell: { enabled: true, price: 250, amount: 1 },
    stock: { mode: "tracked", quantity: 10 }
});

// 3. Programmatically execute a listing purchase
async function buySword(player) {
    const result = await Moneyz.commerce.buyListing(player, "my_pack:blacksmith", "diamond_sword_listing", 1);
    if (result.ok) {
        player.sendMessage(`§aPurchased ${result.amount} Diamond Sword for ${result.total} Moneyz!`);
    } else {
        player.sendMessage(`§cPurchase failed: ${result.reason}`);
    }
}
```

---

## 5. Jobs, Employment & Worker Payroll

Manage employment definitions, worker permits, and payroll distribution.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

// List registered jobs
const jobList = Moneyz.jobs.list();
console.warn(`Available Jobs: ${jobList.map(j => j.name).join(", ")}`);

// Assign job to player
Moneyz.jobs.join(player, "farmer");

// Check current player employment
const currentJob = Moneyz.jobs.getJob(player);
if (currentJob) {
    console.warn(`Player ${player.nameTag} is employed as: ${currentJob.name} (Salary: ${currentJob.pay} Moneyz)`);
}

// Run worker payroll (e.g., scheduled or banker-driven)
function executePayroll(bankerPlayer) {
    const report = Moneyz.jobs.runPayroll(bankerPlayer);
    console.warn(`Payroll complete! Paid ${report.workersPaid} workers a total of ${report.totalPaid} Moneyz.`);
}
```

---

## 6. Real Estate Platform & Rentals

Define, purchase, rent, and manage access to residential or commercial properties.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Register a property in the world
Moneyz.properties.register({
    id: "plot_01",
    name: "Sunset Cottage Plot #1",
    type: "residential",
    price: 15000,
    rent: 500,
    rentIntervalDays: 7
});

// Purchase property for a player
const purchase = Moneyz.properties.purchase(player, "plot_01");
if (purchase.ok) {
    player.sendMessage("§aYou purchased Sunset Cottage Plot #1!");
}

// Grant guest access to another player
Moneyz.properties.grantAccess("plot_01", friendPlayer, "guest");
```

---

## 7. Hotel Engine & Room Reservations

Book hotel rooms for short-term stays with automatic expiration.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Book Hotel Room 101 for 3 Minecraft days
const booking = Moneyz.reservations.book(player, "room_101", {
    durationDays: 3
});

if (booking.ok) {
    player.sendMessage("§aSuccessfully booked Hotel Room 101 for 3 days!");
}

// Check room occupancy status
if (Moneyz.reservations.isReserved("room_101")) {
    const info = Moneyz.reservations.get("room_101");
    console.warn(`Room 101 occupied by ${info.playerName} until ${info.expiresAt}`);
}
```

---

## 8. Products, Entitlements & Pets

Handle specialty products, item bundles, pets, and persistent entitlements.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Grant a VIP Entitlement rank for 30 days
Moneyz.entitlements.grant(player, "role:vip", {
    durationDays: 30,
    tag: "vip_player"
});

if (Moneyz.entitlements.has(player, "role:vip")) {
    player.sendMessage("§aYou hold an active VIP membership!");
}

// Purchase a specialty product bundle
async function purchaseStarterKit(player) {
    const result = await Moneyz.products.purchase(player, "product:starter_kit");
    if (result.ok) {
        player.sendMessage("§aStarter Kit delivered successfully!");
    } else {
        player.sendMessage(`§cPurchase failed: ${result.reason}`);
    }
}
```

---

## 9. Quest Engine v2 & Daily Rewards

Interact with Quest Engine v2 and daily rewards.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

// List available daily quests
const quests = Moneyz.quests.list();

// Start a quest
Moneyz.quests.start(player, "quest:mine_iron_ore");

// Check active quest status
const activeQuest = Moneyz.quests.getActive(player);
if (activeQuest) {
    console.warn(`Active Quest: ${activeQuest.name} (${activeQuest.progress}/${activeQuest.target})`);
}

// Claim daily login reward
const dailyClaim = Moneyz.rewards.claimDaily(player);
if (dailyClaim.ok) {
    player.sendMessage(`§aClaimed daily reward: ${dailyClaim.amount} Moneyz!`);
}
```

---

## 10. Virtual Accounts & Merchants

Virtual accounts allow server scripts, land claim plugins, and businesses to store Moneyz separate from scoreboard balances.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Create a business account
Moneyz.accounts.create("account:city_bank", {
    name: "Central City Bank",
    type: "business"
});

// Deposit capital into business account
Moneyz.accounts.deposit("account:city_bank", 25000);

// Register a merchant tied to business account
Moneyz.merchants.register({
    id: "merchant:city_transit",
    name: "City Transit Line",
    accountId: "account:city_bank"
});

// Charge player for transit ticket
function chargeTransitFare(player) {
    Moneyz.merchants.charge("merchant:city_transit", player, 25, {
        description: "Subway Pass Ticket"
    });
}
```

---

## 11. UI Extensions (Main Menu Buttons)

Add custom action buttons directly to the main **Moneyz Menu**.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

Moneyz.ui.registerMenuItem({
    id: "my_pack:fast_travel",
    label: "§b§lFast Travel Hub\n§r§7[ Teleport Network ]",
    category: "general",
    visible: (player) => player.hasTag("citizen"),
    open: (player) => {
        player.sendMessage("§aOpening Fast Travel Hub...");
        // Custom UI logic here
    }
});
```

---

## 12. Services & NPC Bindings

Register custom services and bind them to NPCs.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Register custom service
Moneyz.services.register({
    id: "my_pack:lottery",
    label: "Town Lottery",
    category: "games",
    open: (player) => {
        player.sendMessage("§aWelcome to Town Lottery!");
    }
});

// Programmatically bind service to targeted NPC entity
Moneyz.npcServices.bind(npcEntity, "my_pack:lottery");
```

---

## 13. Event Bus & Cancellable Hooks

Subscribe to Moneyz lifecycle events using `Moneyz.on(eventName, callback)`.

### Event List
- `beforeTransaction`: Synchronous cancellable hook fired before deposit, withdrawal, or balance edit.
- `beforeTransfer`: Synchronous cancellable hook fired before player-to-player transfer.
- `balanceChanged`: Fired whenever a player's balance changes.
- `transaction`: Fired after transaction completes and logs to ledger.
- `shopChanged`: Fired when shop listings are edited.
- `questCompleted`: Fired when player completes a quest.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Synchronous Cancellable Hook: Prevent transfers > 10,000 Moneyz for untrusted players
Moneyz.on("beforeTransfer", (event) => {
    if (event.amount > 10000 && !event.sender.hasTag("trusted_trader")) {
        event.cancel = true;
        event.reason = "Transfers over 10,000 Moneyz require the Trusted Trader tag.";
    }
});

// Listen to completed transaction events
Moneyz.on("transaction", (event) => {
    console.warn(`[Ledger #${event.id}] ${event.player}: ${event.type} ${event.amount} Moneyz (Balance: ${event.balanceAfter})`);
});
```

---

## 14. Cross-Pack ScriptEvents Gateway

Other behavior packs without direct JavaScript module access can send JSON requests over Bedrock `ScriptEvents`.

### Gateway Specification

- **Channel**: `moneyz:api/request`
- **Response Channel**: `moneyz:api:response/<requestId>`

### Request Protocol

```json
{
  "requestId": "my_request_001",
  "op": "economy.balance",
  "player": "Steve"
}
```

### Supported Operations

`economy.balance`, `economy.deposit`, `economy.withdraw`, `economy.transfer`, `treasury.info`, `shops.list`, `commerce.buy`, `jobs.list`, `jobs.join`, `properties.list`, `reservations.available`, `quests.list`, `services.list`.

### Example: Sender Behavior Pack Code

```javascript
import { system, world } from "@minecraft/server";

// Request balance over ScriptEvents gateway
function requestBalance(playerName) {
    const requestId = `req_${Date.now()}`;
    
    // Subscribe to response channel
    const responseSub = system.afterEvents.scriptEventReceive.subscribe((event) => {
        if (event.id === `moneyz:api:response/${requestId}`) {
            const response = JSON.parse(event.message);
            console.warn(`Received Moneyz Response for ${playerName}: Balance = ${response.value}`);
            system.afterEvents.scriptEventReceive.unsubscribe(responseSub);
        }
    });

    // Dispatch request
    world.getDimension("overworld").runCommand(`scriptevent moneyz:api/request ${JSON.stringify({
        requestId: requestId,
        op: "economy.balance",
        player: playerName
    })}`);
}
```

---

## 15. Pricing & Fee Calculators

Dynamic pricing modifiers and fee providers allow tax or discount calculation.

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Register custom price modifier (e.g., 10% VIP discount)
Moneyz.pricing.registerModifier("vip_discount", {
    priority: 100,
    apply: (player, context, currentPrice) => {
        if (player.hasTag("vip_player")) {
            return Math.floor(currentPrice * 0.90); // 10% off
        }
        return currentPrice;
    }
});
```

---

## 16. Audit Ledger & System Observability

Query recent operational history and platform diagnostics.

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Query recent transaction history (up to 150 entries)
const recentTransactions = Moneyz.audit.getTransactions(10);
recentTransactions.forEach((tx) => {
    console.warn(`[#${tx.id}] ${tx.playerName}: ${tx.type} ${tx.amount} Moneyz (${tx.description})`);
});

// Get system health diagnostic metrics
const health = Moneyz.metrics.getSystemHealth();
console.warn(`System Health: Scoreboard=${health.scoreboardOk}, ActiveShops=${health.activeShopsCount}, LedgerCount=${health.ledgerRecordCount}`);
```
