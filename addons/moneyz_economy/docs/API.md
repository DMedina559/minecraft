# Moneyz Economy Public Platform API Reference (v2.0)

This document provides a comprehensive reference and usage guide for integrating with the **Moneyz Economy Public API**.

Behavior packs, addons, and server scripts should import the public facade from `scripts/api/public.js`. Do not import or modify Moneyz internal storage modules directly.

---

## 1. Importing the SDK & Capability Discovery

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Check platform SDK versions
console.warn(`Moneyz SDK Version: ${Moneyz.apiVersion}`); // e.g. "2.0.0"
console.warn(`Moneyz Version: ${Moneyz.version}`);

// Capability Discovery
if (Moneyz.capabilities.quests) {
    console.warn("Moneyz Quest Engine is enabled!");
}

if (Moneyz.capabilities.products) {
    console.warn("Moneyz Product & Entitlement Engine is enabled!");
}
```

---

## 2. Core Economy Operations

All balance operations interface with the authoritative `Moneyz` scoreboard objective and emit audit events to the Transaction Ledger.

### Methods

- `Moneyz.getBalance(player)`: Returns the integer balance of a player.
- `Moneyz.canAfford(player, amount)`: Returns `true` if the player has at least `amount` Moneyz.
- `Moneyz.deposit(player, amount, metadata)`: Adds Moneyz to a player's balance.
- `Moneyz.withdraw(player, amount, metadata)`: Deducts Moneyz from a player's balance (returns `boolean` success).
- `Moneyz.setBalance(player, amount, metadata)`: Sets a player's balance to an exact amount.
- `Moneyz.transfer(sender, recipient, amount, metadata)`: Safely transfers Moneyz between two players.

### Example

```javascript
import { Moneyz } from "./scripts/api/public.js";

function giveQuestReward(player) {
    const rewardAmount = 250;
    
    // Deposit money with metadata for transaction auditing
    const result = Moneyz.deposit(player, rewardAmount, {
        source: "my_pack:quest_reward",
        pack: "my_custom_addon",
        description: "Completed Daily Dragon Slayer Quest"
    });

    if (result) {
        player.sendMessage(`§aReceived §g${rewardAmount} Moneyz§a! New Balance: §g${Moneyz.getBalance(player)}`);
    }
}

function processPurchase(player, itemCost) {
    if (!Moneyz.canAfford(player, itemCost)) {
        player.sendMessage("§cYou cannot afford this item!");
        return false;
    }

    const success = Moneyz.withdraw(player, itemCost, {
        source: "my_pack:custom_shop",
        pack: "my_custom_addon"
    });

    if (success) {
        player.sendMessage("§aPurchase successful!");
    }
    return success;
}
```

---

## 3. Event Bus & Cancellable Hooks

Subscribe to Moneyz lifecycle events using `Moneyz.on(eventName, callback)`.

### Event List
- `beforeTransaction`: Synchronous cancellable hook fired before any deposit, withdrawal, or balance adjustment.
- `beforeTransfer`: Synchronous cancellable hook fired before a player-to-player transfer.
- `balanceChanged`: Fired whenever a player's Moneyz balance changes.
- `transaction`: Fired after a transaction completes and is recorded.
- `shopChanged`: Fired when shop listings or categories are modified.
- `questStarted`, `questProgress`, `questCompleted`, `questAbandoned`: Quest engine lifecycle events.

### Example: Cancelling Transactions & Listening to Events

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Synchronous Cancellable Hook: Prevent transfers over 10,000 Moneyz for untrusted players
Moneyz.on("beforeTransfer", (event) => {
    if (event.amount > 10000 && !event.sender.hasTag("trusted_trader")) {
        event.cancel = true;
        event.reason = "Transfers over 10,000 Moneyz require the Trusted Trader tag.";
    }
});

// Listen to completed transactions
Moneyz.on("transaction", (event) => {
    console.warn(`[Transaction #${event.id}] ${event.player}: ${event.type} ${event.amount} Moneyz (Balance: ${event.balanceAfter})`);
});

// Listen to quest completions
Moneyz.on("questCompleted", (event) => {
    console.warn(`Player ${event.player.name} completed quest: ${event.questId}`);
});
```

---

## 4. Virtual Accounts & Merchants

Virtual accounts allow server scripts, land claim addons, and businesses to maintain non-player balances. Player balances remain on the scoreboard while system/business accounts are managed securely in Moneyz storage.

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Create a business account
Moneyz.accounts.create("business:town_hall_treasury", {
    name: "Town Hall Treasury",
    type: "government"
});

// Deposit funds into the business account
Moneyz.accounts.deposit("business:town_hall_treasury", 5000);

// Get business account balance
const balance = Moneyz.accounts.getBalance("business:town_hall_treasury");

// Register a merchant that charges players and deposits proceeds into a business account
Moneyz.merchants.register({
    id: "merchant:city_tax",
    name: "City Tax Collector",
    accountId: "business:town_hall_treasury"
});

// Charge player tax
function chargeTax(player) {
    Moneyz.merchants.charge("merchant:city_tax", player, 50, {
        description: "Weekly Property Tax"
    });
}
```

---

## 5. UI Extensions (Custom Main Menu Buttons)

Addons can dynamically register new buttons into the main **Moneyz Menu**.

```javascript
import { Moneyz } from "./scripts/api/public.js";

Moneyz.ui.registerMenuItem({
    id: "my_addon:warp_menu",
    label: "§b§lTeleport Hub\n§r§7[ Fast Travel ]",
    visible: (player) => player.hasTag("citizen"),
    open: (player) => {
        player.sendMessage("§aOpening Teleport Hub...");
        // Custom UI logic here
    }
});
```

---

## 6. Services & Dynamic NPC Bindings

Moneyz 2.0 uses `Moneyz.services` and `Moneyz.npcServices` to route actions consistently across Menus, Commands, ScriptEvents, and NPCs.

### Standard Built-In Services
- `moneyz:shops`: Main Shop Browser
- `moneyz:atm`: ATM Resource Exchange
- `moneyz:send`: Send Moneyz UI
- `moneyz:jobs`: Jobs & Employment
- `moneyz:properties`: Real Estate & Rentals
- `moneyz:hotel`: Hotel Services
- `moneyz:quests`: Quest Engine
- `moneyz:rewards`: Daily Rewards
- `moneyz:lucky`: Lucky Purchase & Games
- `moneyz:help`: Moneyz Guide
- `moneyz:admin`: Moneyz Admin Menu

### Registering Custom NPC Services

```javascript
import { Moneyz } from "./scripts/api/public.js";

// Register a custom NPC service
Moneyz.npcServices.register({
    id: "my_addon:bank_vault",
    name: "Bank Vault Service",
    open: (player) => {
        player.sendMessage("§aWelcome to the Bank Vault!");
    }
});
```

### Binding NPCs via Command or Script
Stand near an NPC and execute in chat:
- `/moneyz:npc <serviceId>` (e.g. `/moneyz:npc moneyz:quests` or `/moneyz:npc my_addon:bank_vault`)
- `/moneyz:npc_shop <shopId>` (e.g. `/moneyz:npc_shop armory`)

Or via ScriptEvent command in command blocks or dialogues:
- `/scriptevent moneyz:menu/open moneyz:quests`

---

## 7. Products, Entitlements & Hotel Reservations

Moneyz includes persistent engines for custom products, player entitlements/permissions, and hotel room reservations.

```javascript
import { Moneyz } from "./scripts/api/public.js";

// --- Entitlements (VIP Memberships, Licenses) ---
// Grant VIP entitlement for 30 days
Moneyz.entitlements.grant(player, "role:vip", {
    durationDays: 30,
    tag: "vip_player" // Automatically grants vanilla tag 'vip_player' while active
});

// Check if player has active entitlement
if (Moneyz.entitlements.has(player, "role:vip")) {
    player.sendMessage("§aWelcome VIP Player!");
}

// --- Hotel Room Reservations ---
// Book Room 101 for 7 Minecraft days
Moneyz.reservations.book(player, "hotel_room_101", {
    durationDays: 7
});

if (Moneyz.reservations.isReserved("hotel_room_101")) {
    const info = Moneyz.reservations.get("hotel_room_101");
    console.warn(`Room 101 occupied by ${info.playerName} until ${info.expiresAt}`);
}
```

---

## 8. Script API Compatibility Summary

| Service / API | Script API Namespace | Description |
| :--- | :--- | :--- |
| **Economy** | `Moneyz` | Scoreboard balance CRUD operations |
| **Services** | `Moneyz.services` | Routing layer for UI menus & commands |
| **NPC Binding** | `Moneyz.npcServices` | Binding service IDs to NPC entities |
| **Shops** | `Moneyz.shops` | Shop Engine v3 categories & item listings |
| **Commerce** | `Moneyz.commerce` | Purchase execution & refund handling |
| **Virtual Accounts** | `Moneyz.accounts` | Business / non-player accounts |
| **UI Extensions** | `Moneyz.ui` | Main Menu extension registry |
| **Entitlements** | `Moneyz.entitlements` | Player roles, ranks, and permits |
| **Reservations** | `Moneyz.reservations` | Hotel room bookings & rental timers |
| **Events** | `Moneyz.on()` | Cancellable hooks & lifecycle listeners |
