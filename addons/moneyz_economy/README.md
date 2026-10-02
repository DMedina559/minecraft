# Downloading Moneyz Economy

Download Moneyz Economy from MCPEDL:

https://mcpedl.com/moneyz-economy/

# Moneyz Economy

**Moneyz Economy** is a complete economy, shop, quest, rewards, and minigame system for Minecraft Bedrock Edition.

Moneyz was originally created for **MountainSide Villages** and can also be installed in other Bedrock worlds to add a configurable economy without requiring world creators to build their own scoreboard, shop, payment, quest, and administration systems.

Moneyz includes:

- Scoreboard-based currency
- Player-to-player payments
- Buy and sell shops
- Custom shops
- Daily rewards
- Daily quests
- Lucky purchases
- Chance minigames
- Transaction tracking
- Administrative tools
- Configurable player/world features
- NPC integration
- Custom Moneyz commands
- A DDUI-based in-game interface
- APIs and events for integration with other behavior packs

Moneyz continues to use the `Moneyz` scoreboard as its currency, making it compatible with Minecraft commands, NPCs, command blocks, and other behavior packs.

---

# Getting Started

Enable the Moneyz Economy behavior pack in your world and make sure cheats are enabled.

Run:

`/function setup`

> [!NOTE]
> Setup creates the `Moneyz` scoreboard and initializes currently online players.
>
> It also provides the items/resources required to begin configuring Moneyz.

If you need an NPC, you can summon one with:

`/summon npc ~ ~ ~`

or use an NPC Spawn Egg.

Moneyz also includes its own **Moneyz Menu**, which gives players access to enabled economy features without requiring every feature to be attached to an NPC.

---

# Moneyz Currency

Moneyz uses the scoreboard objective:

`Moneyz`

This remains the authoritative player balance.

Because Moneyz uses a normal Minecraft scoreboard, balances can still be viewed or manipulated by commands when necessary:

`/scoreboard players get <player> Moneyz`

Moneyz itself uses its Script API economy service for normal transactions so purchases, rewards, transfers, games, and administrative changes can be validated and recorded consistently.

---

# Moneyz Menu

The Moneyz Menu is the main player interface.

The current Moneyz interface uses Minecraft Bedrock's **Data Driven UI (DDUI)** system, allowing menus such as administration, shops, settings, games, and quests to behave more like persistent interfaces rather than chains of separate forms.

Depending on which features are enabled, players can access:

- Moneyz balance
- Shops
- ATM services
- Send Moneyz
- Daily Rewards
- Daily Quests
- Lucky Purchase
- Chance Games
- Help
- Credits

Authorized administrators additionally have access to the Moneyz Admin tools.

---

# Moneyz Admin

The Admin interface provides centralized management of the Moneyz system.

Administrators can manage:

- Player balances
- Player tags
- World and player properties
- Shops
- Moneyz settings
- Transaction history
- System diagnostics
- Data migrations

Balance changes performed through Moneyz are recorded by the transaction system.

Moneyz also provides administrative custom commands.

Examples include:

`/moneyz:balance`

`/moneyz:give`

`/moneyz:take`

`/moneyz:set`

`/moneyz:reload`

`/moneyz:health`

`/moneyz:migrate`

`/moneyz:transactions`

> [!NOTE]
> Administrative commands require the appropriate command permission level.

---

# Feature Configuration

Moneyz features can be enabled or disabled from the Settings interface.

Current configurable features include:

- ATM
- Send Moneyz
- Shops
- Daily Rewards
- Quests
- Lucky Purchase
- Chance Games

Moneyz also supports synchronizing configured feature access to players.

Older Moneyz versions used tags such as:

- `moneyzATM`
- `moneyzSend`
- `moneyzShop`
- `moneyzQuest`
- `moneyzDaily`
- `moneyzLucky`
- `moneyzChance`

Current versions migrate legacy configuration where possible and primarily use persistent Moneyz properties for feature state.

The `moneyzAdmin` tag remains useful for identifying players who should have access to Moneyz administrative functionality where applicable.

---

# Shops

Moneyz provides built-in shops for buying and selling Minecraft items.

Available shop categories include systems such as:

- Armory
- Crafter's Shop
- Farmer's Market
- Library
- Pet Shop
- Workshop
- Custom Shops

Purchases and sales are processed through Moneyz's commerce system.

A purchase generally follows:

1. Validate the item and price
2. Validate the player's balance
3. Withdraw Moneyz
4. Deliver the item
5. Record the transaction

If delivery fails, Moneyz attempts to refund the transaction rather than simply consuming the player's Moneyz.

Sales similarly validate the player's inventory before completing payment.

---

# Custom Shops

World Owners/Admins can create and manage custom shops from inside Moneyz.

Custom shop entries can define information such as:

- Item ID
- Display name
- Buy amount
- Buy price
- Sell amount
- Sell price
- Item data where required
- Icon/resource information

Current Moneyz versions use structured shop data internally instead of the older CSV-style custom shop representation.

Existing legacy shop data can be migrated to the current format.

---

# NPC Shops

Moneyz continues to support Minecraft NPCs.

NPCs are useful for roleplay worlds because NPC commands can execute in relation to the player interacting with the NPC using `@initiator`.

For example:

`dialogue open @s @initiator workshop_buy`

or:

`function petshop/pets/dog`

This avoids relying on selectors such as `@p`, which can accidentally select another nearby player.

## Creating an NPC Shop

Summon an NPC:

`/summon npc ~ ~ ~`

Interact with the NPC and select **Edit Dialog**.

Configure the NPC text, then use **Advanced Settings** to add a button.

A button can open one of the included Moneyz dialogues:

`dialogue open @s @initiator {dialogue}`

or execute a specific Moneyz function.

> [!TIP]
> Dialogue-based shops are recommended where available because their menus can be updated by the pack without requiring every NPC button to be manually rewritten.

---

# Available NPC Dialogues

Moneyz includes dialogue configurations such as:

`armory`  
Armor, weapon, and tool shop.

Supports:

`armory_buy`

`armory_sell`

---

`atm`  
Moneyz/resource exchange services.

---

`banker`  
Banking/worker-pay related services.

---

`craftershop`  
Crafter's Shop.

Supports:

`crafter_buy`

`crafter_sell`

---

`farmers_market`  
Farmer's Market.

Supports:

`farmer_buy`

`farmer_sell`

---

`help`  
Moneyz help and information.

---

`hotel`  
Hotel-related services.

---

`jobs`  
Employment/quest related services.

---

`library`  
Library Shop.

Supports:

`library_buy`

`library_sell`

---

`petshop`  
Pet Shop.

Supports:

`petshop_buy`

`petshop_sell`

---

`realtor`  
Real-estate related services.

---

`universal`  
Access to multiple Moneyz dialogues.

---

`workshop`  
Workshop.

Supports:

`workshop_buy`

`workshop_sell`

---

# Configuring Existing NPCs

You can change a nearby NPC to a configured dialogue with:

`/dialogue change @e[type=npc,r=5,c=1] {dialogue}`

while standing near the NPC.

Moneyz may also provide setup functions for quickly creating configured NPCs:

`/function setup/{shop}`

Admins can directly open a dialogue with:

`/dialogue open @s @s {dialogue}`

---

# Send Moneyz

Players can transfer Moneyz directly to another online player.

From the Moneyz Menu:

1. Open **Send Moneyz**
2. Select the recipient
3. Enter the amount
4. Submit the transfer

Moneyz validates the transfer through the economy service rather than independently modifying two scoreboard values from the UI.

Successful transfers are recorded in the transaction ledger.

---

# Daily Rewards

Players can claim a configurable daily Moneyz reward.

The reward amount is controlled by the Moneyz configuration.

After claiming a reward, Moneyz records the claim date so the player cannot claim it repeatedly during the same reward period.

Legacy worlds may contain:

`lastDailyReward`

using a UTC `YYYY-MM-DD` date.

Moneyz preserves/migrates existing state where appropriate.

Administrators can configure the reward amount from the Moneyz Settings interface.

---

# Quest System

Moneyz includes **Quest Engine v2**, which manages quest selection, progression, persistence, rewards, and completion.

Players can receive tasks such as:

- Mine resources
- Harvest crops
- Slay hostile mobs
- Slaughter farm animals
- Maintain a Moneyz balance for a period of time
- Patrol or remain within a specified location

Quest progress is persisted and existing compatible quest progress from older Moneyz versions is migrated where possible.

## Quest Rewards

Quests can provide:

- Moneyz while progressing
- Moneyz on completion
- Experience
- Items

Progress rewards and completion rewards are treated separately by the economy system.

For example, a mining job may pay a small amount for each valid block plus a larger completion bonus.

## Peaceful Difficulty

Moneyz checks the world's current difficulty when generating quests.

When the world is set to **Peaceful**, quests requiring hostile mobs are excluded from the available/random quest pool.

Animal, mining, farming, patrol, and economy-based quests can still be selected normally.

If a hostile-mob quest is already active when the world is changed to Peaceful, its progress is preserved rather than automatically deleted.

---

# Quest Engine Integration

Other Moneyz/MSV scripts can interact with the quest system through the Moneyz API.

The quest API supports operations such as:

- Getting the active quest
- Getting available quests
- Starting a quest
- Abandoning a quest
- Reading progress

Moneyz also emits quest lifecycle events including:

- `questStarted`
- `questProgress`
- `questCompleted`
- `questAbandoned`

This allows other behavior-pack systems to react to Moneyz quest activity without directly modifying Moneyz's internal properties.

---

# Feeling Lucky

The Lucky section contains two separate systems:

- Lucky Purchase
- Chance Games

---

# Lucky Purchase

Lucky Purchase allows a player to spend Moneyz for a randomized reward generated from the Moneyz loot configuration.

By default, Lucky Purchase can be limited to once per day.

After a limited purchase, Moneyz records the date of the player's last Lucky Purchase.

Legacy worlds may contain:

`lastLuckyPurchase`

using UTC `YYYY-MM-DD` format.

The daily limitation can be configured from the Moneyz Settings interface.

Lucky Purchase uses transactional purchase logic: if the player is charged but Moneyz cannot successfully deliver the reward, Moneyz attempts to refund the purchase.

---

# Chance Games

Moneyz includes several games where players can stake Moneyz.

Current games include:

- Test Your Luck
- 21 / Blackjack
- Dice / Craps
- Slots

Games use Moneyz's centralized Game Economy service for stake validation, bets, payouts, pushes, and transaction recording.

A player cannot intentionally start multiple overlapping Moneyz game sessions to place concurrent bets.

> [!IMPORTANT]
> Once a game has accepted and deducted a stake, leaving an active game may forfeit the stake. This prevents closing a game after seeing an unfavorable result from acting as an undo/refund exploit.

---

# Test Your Luck

Test Your Luck is the configurable probability-based Moneyz game.

The administrator-configured **Win Chance** determines the percentage chance of winning.

For example:

`50`

represents a 50% configured win chance.

The game displays the generated roll/result so the configured probability has a clear meaning.

This setting applies to **Test Your Luck** and does not secretly alter the rules of Blackjack, Craps, or Slots.

---

# 21 / Blackjack

21 now uses Blackjack-style hand logic rather than a generic random win check.

Features include:

- Player and dealer hands
- Hit/stand gameplay
- Aces valued as 11 or 1 as necessary
- Dealer draw behavior
- Busts
- Natural Blackjack handling
- Push/tie handling

A push returns the player's stake.

Blackjack outcomes are determined by the cards/game rules rather than the global Test Your Luck win percentage.

---

# Dice / Craps

The dice game uses pass-line style Craps rules.

On the come-out roll:

- 7 or 11 wins
- 2, 3, or 12 loses
- Other valid values establish the point

After a point is established:

- Rolling the point wins
- Rolling 7 loses
- Other rolls continue the round

The outcome is determined by the dice rather than an additional hidden win-chance roll.

---

# Slots

Slots use weighted reel results and an explicit payout system.

Different combinations have different results, with rarer symbols/combinations producing different payouts.

The global Test Your Luck win percentage does not manipulate the slot reels.

---

# Game Payout Multiplier

Moneyz retains the configurable game payout multiplier used by applicable Moneyz games.

This controls how winning stakes are converted into payouts.

For example, with a multiplier of `2`, a qualifying 15 Moneyz stake can produce a 30 Moneyz payout according to the rules of the game.

Configure game settings through the Moneyz Admin/Settings interface.

---

# Transaction System

Modern Moneyz includes a transaction ledger.

Economy operations can record information including:

- Transaction ID
- Timestamp
- Transaction type
- Player/actor
- Sender
- Recipient
- Amount
- Balance before
- Balance after
- Additional metadata

Examples of tracked transaction types include:

- Player transfers
- Shop purchases
- Shop sales
- Shop refunds
- Admin adjustments
- Daily rewards
- Quest progress rewards
- Quest completion rewards
- Game bets
- Game payouts
- Lucky Purchases
- Lucky Purchase refunds

Administrators can inspect recent transaction activity from Moneyz.

The in-world ledger is intentionally bounded rather than acting as an unlimited database.

---

# Moneyz Platform API

Moneyz now provides an internal/public integration layer for other scripts and behavior-pack systems.

This allows projects such as MountainSide Villages and compatible addons to interact with Moneyz without depending directly on its storage implementation.

Integration functionality includes areas such as:

- Balance lookup
- Deposits
- Withdrawals
- Transfers
- Configuration
- Shops
- Quests
- Transactions
- Moneyz events

The `Moneyz` scoreboard remains the underlying currency, but integrations should use the Moneyz API where possible.

This allows the implementation to evolve without requiring every dependent system to be rewritten.

---

# Moneyz Events

Moneyz includes an internal event system for integrations.

Events can include things such as:

- Transactions
- Balance changes
- Shop changes
- Quest started
- Quest progress
- Quest completed
- Quest abandoned

This is useful for integrating Moneyz with systems such as MountainSide Villages, Transfer UI, server-management tooling, and other behavior packs.

---

# Script Events

Moneyz also supports selected Script Event integration.

Examples include administrative/integration operations such as reloading Moneyz or shop state.

Financial mutation is intentionally more restricted than general Script Events so arbitrary command blocks or unrelated scripts cannot freely generate Moneyz without going through appropriate validation.

---

# Moneyz Data & Migration

Moneyz stores persistent configuration and state using Minecraft Bedrock dynamic properties.

Modern Moneyz includes an explicit data/schema version so updates can migrate older Moneyz data instead of guessing which version created it.

Examples of managed state include:

- World configuration
- Player configuration
- Daily reward state
- Lucky Purchase state
- Quest state
- Shop data
- Transaction data
- Moneyz schema/API information

Legacy tags/properties and older custom-shop data are migrated where supported.

> [!IMPORTANT]
> Do not manually delete Moneyz properties from an existing world unless you understand what system owns them. They may contain migration or player progression information.

---

# Diagnostics

Moneyz provides diagnostics intended for World Owners/Admins and server operators.

Use:

`/moneyz:health`

to inspect the current Moneyz installation.

Diagnostics can include information such as:

- Moneyz API version
- Moneyz schema version
- Scoreboard availability
- Loaded players
- Loaded shops
- Transaction state
- Configuration/synchronization state
- Migration state

This is particularly useful when troubleshooting dedicated servers or integrations.

---

# Moneyz Item Infrastructure

Modern Moneyz also contains infrastructure for persistent Moneyz-related items using ItemStack dynamic properties.

This provides a foundation for systems such as:

- Receipts
- Vouchers
- Gift cards
- Tickets
- Debit/payment cards
- Invoices
- Property or business documents

These systems can associate persistent Moneyz metadata with an item without relying entirely on visible item lore.

Not every infrastructure feature is necessarily exposed as standard gameplay in every Moneyz release.

---

# Help

Moneyz includes help documentation for players and World Owners/Admins.

For NPC-based worlds, it is recommended to place a Help NPC somewhere accessible.

To configure a nearby NPC:

`/dialogue change @e[type=npc,r=5,c=1] help`

Or configure an NPC button to run:

`dialogue open @s @initiator help`

The Help dialogue contains information for both players using Moneyz and administrators configuring shops/services.

---

# Dialogue vs Function

Dialogue commands are recommended for NPC shop menus where available.

For example:

`dialogue open @s @initiator workshop_buy`

Dialogues allow the pack to maintain the menu contents without requiring the World Owner to manually configure a separate NPC command for every item.

Function commands are still useful when a world creator specifically wants an NPC button to perform one individual Moneyz action.

NPCs have a limited number of visible buttons, while dialogues can create multiple menu levels and allow one NPC to provide a much larger service.

Existing NPCs can be updated with:

`/dialogue change @e[type=npc,r=5,c=1] {dialogue}`

while standing near the NPC.

---

# Legacy Function Reference

Legacy/function-based Moneyz content can be found under:

`raw/functions`

These functions remain useful for existing worlds, NPC configurations, command blocks, and compatibility.

New Script API systems should generally use the Moneyz service/API architecture where appropriate.

---

# Item & Price Reference

A Google Sheets reference containing Moneyz items/prices is available here:

https://docs.google.com/spreadsheets/d/1TG4Ol5z_8U7mEJlSLx4I2LBmPVcJ0Aawu3_o_ac4xvU

---

# Credits

Moneyz Economy was developed for Minecraft Bedrock Edition and is used by MountainSide Villages.

Special thanks to **SoullessReaperYT** for their original custom-menu video and GUI template:

https://www.youtube.com/watch?v=6sjZkGPCF5A