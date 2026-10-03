import { system } from "@minecraft/server";
import { CustomForm } from "@minecraft/server-ui";

const nav = (f, fn) => {
    try {
        if (f.isShowing()) f.close();
    } catch {}
    system.run(fn);
};

const guideTopics = {
    "§l§11. Getting Started & Currency": `§l§9=== Getting Started with Moneyz Economy v2.0 ===§r

§lCurrency System:§r
• Moneyz uses the §6Moneyz§r scoreboard objective as the authoritative player balance.
• Compatible with vanilla commands, scoreboard displays, command blocks, and plugins.
• View your balance anytime in the Moneyz Menu or via chat: §6/scoreboard players get @s Moneyz§r.

§lAccessing Moneyz:§r
• §lMoneyz Menu Item:§r Use the Moneyz Menu item in your hand to open the main menu.
• §lCommand:§r Run §6/moneyz:open§r in chat.
• §lNPC Services:§r Interact with designated NPC service providers in the world.

§lEarning Moneyz:§r
1. §lJobs:§r Apply for employment at Town Hall or via the Jobs menu.
2. §lQuests:§r Complete daily mining, farming, slaying, or patrol quests.
3. §lSelling Items:§r Sell resources and crafted items at shops.
4. §lATM Exchange:§r Trade valuable ores/ingots for Moneyz at an ATM.
5. §lDaily Rewards:§r Claim your daily login reward bonus.`,

    "§l§12. Moneyz Menu Navigation": `§l§9=== Moneyz Menu Features ===§r

The Moneyz Menu is your central hub for all economy operations:

• §lShops:§r Browse categories to buy and sell items with live prices and stock.
• §lATM:§r Instantly exchange resources (copper, iron, gold, diamond, emerald, netherite) for Moneyz or vice versa.
• §lSend Moneyz:§r Securely transfer Moneyz directly to another online player.
• §lJobs & Employment:§r View available jobs, apply, check work status, or request wage payouts.
• §lReal Estate & Hotels:§r Browse property rentals, pay rent, or book hotel room stays.
• §lQuests:§r View active quest objectives, progress rewards, and accept new daily tasks.
• §lDaily Rewards:§r Claim a daily Moneyz reward bonus.
• §lFeeling Lucky?:§r Try Lucky Purchase for random loot or play Chance Games (Blackjack, Craps, Slots, Test Your Luck).
• §lMoneyz Admin:§r (Admins only) Comprehensive administrative management tools.`,

    "§l§13. Shop Engine v3 & Custom Shops": `§l§9=== Shop Engine v3 ===§r

Modern Moneyz features Shop Engine v3, driven directly by Script API logic:

§lFeatures:§r
• §lLive Listings:§r Real-time buy and sell pricing with support for bundle sizes and quantity multipliers.
• §lStock Tracking:§r Support for both unlimited and finite shop item stock.
• §lBuilt-in Categories:§r Armory, Crafter's Shop, Farmer's Market, Library, Pet Shop, Workshop, and Custom Shops.

§lCustom Shops (World Owners):§r
• Admins can create and customize shop categories and item listings entirely in-game via §6Moneyz Admin → Manage Shops§r.
• Define item ID, display name, buy price, sell price, stack amounts, data values, and icon textures without editing JSON files.`,

    "§l§14. ATM & Player Transfers": `§l§9=== ATM & Money Transfers ===§r

§lATM Currency Exchange:§r
Exchange valuable ores and materials for Moneyz (or convert Moneyz back into items):
• §rNetherite Ingot = 1,000 Moneyz
• §rEmerald = 100 Moneyz
• §rDiamond = 75 Moneyz
• §rIron Ingot = 50 Moneyz
• §rGold Ingot = 25 Moneyz
• §rCopper Ingot = 10 Moneyz
• §rCoal = 5 Moneyz

§lSend Moneyz:§r
• Open §6Send Moneyz§r from the Moneyz Menu.
• Select any online player on the server.
• Enter the desired Moneyz transfer amount.
• Transfers are validated synchronously through the Economy Service and logged to the Transaction Ledger.`,

    "§l§15. Jobs, Real Estate & Hotels": `§l§9=== Jobs, Real Estate & Hotels ===§r

§lJobs & Employment:§r
• Apply for jobs such as Miner, Farmer, Hunter, Builder, and more.
• Earn salary payouts based on active time or completed tasks.
• Quit or switch jobs anytime through the Jobs menu.

§lReal Estate:§r
• Rent residential properties and houses in town.
• Pay recurring rent every 7 Minecraft days.
• Move out or transfer tenancy through the Real Estate menu or Realtor NPC.

§lHotel Services:§r
• Rent hotel rooms for short-term stays.
• Gain temporary access to hotel amenities and sleeping quarters.`,

    "§l§16. Daily Rewards & Quest Engine": `§l§9=== Daily Rewards & Quests ===§r

§lDaily Rewards:§r
• Claim a configurable daily Moneyz payout once every 24 hours (UTC reset).
• Admins can configure reward amounts in Moneyz Admin Settings.

§lQuest Engine v2:§r
• §lQuest Types:§r Mining, Crop Harvesting, Hostile/Passive Mob Slaying, Location Patrols, and Balance Retention.
• §lRewards:§r Earn incremental progress payouts as you complete steps, plus a completion bonus.
• §lPeaceful Difficulty:§r Hostile mob quests are automatically filtered out when the world is set to Peaceful.
• §lAbandoning:§r Quests can be safely abandoned at any time via the Quest menu.`,

    "§l§17. Lucky Purchases & Chance Games": `§l§9=== Lucky Purchases & Chance Games ===§r

§lLucky Purchase:§r
• Spend a fixed Moneyz fee for a daily randomized item draw from the Moneyz loot table.
• Features refund protection if reward delivery fails.

§lChance Games:§r
• §l21 / Blackjack:§r Full Blackjack rules with player/dealer hit, stand, bust, natural 21, and push/tie handling.
• §lDice / Craps:§r Pass-line Craps rules (7/11 win on come-out, 2/3/12 craps out, establish point).
• §lSlots:§r Weighted reel slot machine with variable symbol payouts.
• §lTest Your Luck:§r Direct probability roll using world-configured win percentage.
• §lGame Economy:§r Centralized stake validation prevents overlapping bets and double-spending.`,

    "§l§18. Admin Tools & Settings": `§l§9=== Moneyz Admin Guide ===§r

Access requires the §6moneyzAdmin§r tag or command permission level.

§lAdmin Capabilities:§r
• §lManage Balances:§r View, give, take, or set player Moneyz balances.
• §lPlayer Tags & Properties:§r View and modify player feature permission flags (\`moneyzShop\`, \`moneyzATM\`, \`moneyzSend\`, \`moneyzDaily\`, \`moneyzQuest\`, \`moneyzLucky\`, \`moneyzChance\`).
• §lWorld Properties:§r Configure global settings (daily reward amount, game win chance, payout multiplier, log levels, patrol locations).
• §lShop Editor:§r Add, edit, or disable shop categories and items in real time.
• §lNPC Service Management:§r Bind services directly to nearby NPCs.`,

    "§l§19. Commands & NPC Services": `§l§9=== Commands & NPC Services ===§r

§lAdministrative Commands:§r
• §6/moneyz:balance <player>§r - Check player balance.
• §6/moneyz:give <player> <amount>§r - Add Moneyz to player balance.
• §6/moneyz:take <player> <amount>§r - Remove Moneyz from player balance.
• §6/moneyz:set <player> <amount>§r - Set player balance.
• §6/moneyz:services§r - List all registered API service IDs.
• §6/moneyz:open <serviceId>§r - Open a Moneyz service menu directly.
• §6/moneyz:shops§r - List registered shop IDs.
• §6/moneyz:npc <serviceId>§r - Bind a service to a targeted NPC.
• §6/moneyz:npc_shop <shopId>§r - Bind a specific shop to a targeted NPC.
• §6/moneyz:health§r - Run diagnostic checks.
• §6/moneyz:reload§r - Reload shops and configuration.
• §6/moneyz:transactions§r - View recent transaction history.

§lNPC Setup:§r
Stand near an NPC and execute §6/moneyz:npc <serviceId>§r or §6/moneyz:npc_shop <shopId>§r to turn the NPC into an interactive provider.`,

    "§l§110. Diagnostics & Ledger": `§l§9=== System Diagnostics & Transaction Ledger ===§r

§lTransaction Ledger:§r
• Records player transfers, shop purchases, shop sales, refunds, admin adjustments, quest payouts, daily rewards, game stakes, and winnings.
• Logs Transaction ID, timestamp, player, amount, and balance delta.
• Viewable in-game via §6Moneyz Admin → Transactions§r or §6/moneyz:transactions§r.

§lSystem Health Diagnostics:§r
• Execute §6/moneyz:health§r in chat to verify system integrity.
• Displays API version, Schema version, scoreboard status, active player count, loaded shops, transaction state, and configuration sync status.`,

    "§l§111. Developer & Public API": `§l§9=== Developer & Public API ===§r

Moneyz Economy v2.0 exposes a global Script API integration layer for other behavior packs:

§lGlobal SDK Namespace:§r
• §6Moneyz.services§r - Service registry and execution.
• §6Moneyz.shops§r - Shop Engine v3 data and listings.
• §6Moneyz.commerce§r - Transaction execution, deposits, withdrawals, and refunds.
• §6Moneyz.npcServices§r - NPC binding registry.
• §6Moneyz.events§r - Event listeners for transactions, balance changes, and quest progression.
• §6Moneyz.treasury§r - Treasury liquidity and resource reserves.
• §6Moneyz.realEstate§r / §6Moneyz.reservations§r - Properties, hotels, access, and bookings.
• §6Moneyz.audit§r / §6Moneyz.metrics§r - Audit history and platform observability.
• §6Moneyz.pricing§r / §6Moneyz.fees§r - Shared price modifiers and fee providers.
• §6Moneyz.merchants§r / §6Moneyz.accounts§r - Merchant and virtual-account infrastructure.
• §6Moneyz.escrow§r / §6Moneyz.invoices§r - Higher-level payment building blocks.

§lCross-Pack API 2.0:§r
Read-only gateway operations now expose metrics, audit queries, public configuration, permissions, merchant/extension/currency discovery, pricing, and fee calculation in addition to Economy, Treasury, Shops, Jobs, Real Estate, Hotels, Reservations, Quests, and Services. Privileged changes remain permission-controlled instead of exposing an unrestricted remote admin API.

§lUI Extensions:§r
• Behavior packs can register custom menu options into the Moneyz Menu using §6Moneyz.ui.registerMenuItem()§r.`,

    "§l§112. Treasury & Reserve Economy": `§l§9=== Treasury & Reserve Economy ===§r

Moneyz 2.0 can run in three economy modes:
• §lClassic:§r Legacy behavior. System liquidity is unlimited.
• §lTreasury:§r System payouts require enough Moneyz in the world treasury. Player purchases, rent, hotel bookings, and game stakes add funds back to the treasury.
• §lReserve Economy:§r Treasury rules plus physical ATM resource reserves. Deposited resources become reserve assets and resource withdrawals require available stock.

§lWhen funds run low:§r
Moneyz does not crash. A shop sale, job payment, reward, property sale, or other system payout is rejected safely before value is lost.

§lAdmins:§r
Open §6Moneyz Admin → Economy Treasury§r to view liquid funds, resource backing, total backing, inflow/outflow, select the economy mode, and add/remove treasury funds.

§lPlayers:§r
Player-to-player transfers do not use treasury liquidity because no Moneyz enters or leaves the player economy.`,

    "§l§113. Real Estate Platform & Addon API": `§l§9=== Real Estate Platform ===§r

Worlds start without arbitrary properties because every map is different. Admins or compatible addons register the properties and hotels that belong in that world.

§lProperty features:§r
• Residential, commercial, hotel, and custom metadata definitions.
• Purchase, sale, rental, rent payments, ownership queries, and availability.
• Owner-managed guest access with roles such as guest or manager.
• Hotel reservations, availability checks, checkout, and expiration.

§lAddon API:§r
Other behavior packs can use §6Moneyz.realEstate§r / §6Moneyz.properties§r and §6Moneyz.reservations§r to register namespaced properties and hotels, query ownership, purchase/rent through Moneyz, and check property access.

Gateway operations include §6realestate.list§r, §6realestate.get§r, §6realestate.register§r, §6realestate.purchase§r, §6realestate.sell§r, §6realestate.rent§r, §6realestate.access.*§r, §6hotels.register§r, §6hotels.list§r, and §6reservations.available§r.

Property payments participate in Treasury mode automatically.`
};

export function openHelp(player) {
    const form = new CustomForm(player, "§l§1Moneyz Economy Guide");
    form.header("Moneyz Economy v2.0 Guide");
    form.label("§7Select a topic below to view comprehensive instructions, commands, and feature guides.");

    for (const title of Object.keys(guideTopics)) {
        form.button(title, () => nav(form, () => helpPage(player, title)));
    }

    form.closeButton().show();
}

function helpPage(player, title) {
    const form = new CustomForm(player, title);
    form.label(guideTopics[title] ?? "No content available.");
    form.button("Back to Topics", () => nav(form, () => openHelp(player)));
    form.closeButton().show();
}
