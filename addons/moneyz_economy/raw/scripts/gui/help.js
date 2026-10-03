import { system } from "@minecraft/server";
import { CustomForm } from "@minecraft/server-ui";

const nav = (f, fn) => {
    try {
        if (f.isShowing()) f.close();
    } catch {}
    system.run(fn);
};

const guideTopics = {
    "§l§11. Getting Started & World Setup": `§l§9=== Getting Started & World Setup ===§r

§lScoreboard Currency System:§r
• Moneyz uses the §6Moneyz§r scoreboard objective as the authoritative player balance.
• Fully compatible with vanilla commands, displays, command blocks, and plugins.
• View your balance anytime in the Moneyz Menu or via chat: §6/moneyz:balance§r.

§lWorld Owner Setup:§r
1. Run §6/moneyz:setup§r in chat to initialize the world economy.
2. The setup command creates the §6Moneyz§r objective, initializes online player balances, grants the §6moneyzAdmin§r tag, and gives you the Moneyz Menu item (§6zvortex:moneyz_menu§r).
3. Access §6/moneyz:admin§r → §6Setup Wizard§r for an interactive world configuration checklist.

§lAccessing Moneyz:§r
• §lMoneyz Menu Item:§r Use/click the Moneyz Menu item in your hand.
• §lCommands:§r Use §6/moneyz:menu§r, §6/moneyz:open <serviceId>§r, or §6/moneyz:help§r.
• §lNPC Services:§r Interact directly with interactive NPC service providers in the world.`,

    "§l§12. Moneyz Menu Navigation": `§l§9=== Main Menu Navigation ===§r

The Moneyz Menu is your central hub for all economy operations:

• §lShops Engine v3:§r Browse categories to buy and sell items with live prices and stock tracking.
• §lATM Exchange:§r Trade resources (ores/ingots) for Moneyz or convert Moneyz into items.
• §lSend Moneyz:§r Securely transfer Moneyz directly to any online player on the server.
• §lJobs & Employment:§r View available jobs, apply for positions, quit, or run worker payroll.
• §lReal Estate & Hotels:§r Rent or purchase properties, pay rent, or book short-term hotel stays.
• §lProducts & Pet Shop:§r Purchase item bundles, pet products, entitlements, and special services.
• §lQuests & Daily Rewards:§r Complete daily mining/farming/slaying quests and claim daily login bonuses.
• §lFeeling Lucky & Games:§r Try Lucky Purchase for shop catalog rewards or play Blackjack, Craps, Slots, and Test Your Luck.
• §lMoneyz Admin:§r Privileged administrative dashboard for world management (Admins only).`,

    "§l§13. Economy System Modes & Treasury Engine": `§l§9=== Economy Modes & Treasury Engine ===§r

Moneyz 2.0 supports three flexible world economy modes (configured in §6Admin → Economy Treasury§r):

§l1. Classic Mode:§r
• System funds are unlimited. Shop payouts, job salaries, daily rewards, and quest bonuses are paid from infinite liquidity.

§l2. Treasury Mode:§r
• All system payouts (jobs, rewards, quests) require available liquidity in the World Treasury.
• Player shop purchases, property rent, hotel bookings, and chance game stakes feed directly back into the Treasury.
• Prevents infinite Moneyz inflation in custom survival or roleplay worlds.

§l3. Reserve Economy Mode:§r
• Combines Treasury Mode rules with physical ATM resource reserves.
• Depositing items at the ATM adds physical reserve backing, and withdrawing resources requires active reserve stock.

§lInsolvency Protection:§r
• In Treasury and Reserve modes, if system funds or item reserves run out, transactions fail safely without taking items or balances.
• Admins can monitor and adjust funds via §6Moneyz Admin → Economy Treasury§r or §6Resource Reserve Manager§r.`,

    "§l§14. Shop Engine v3 & Custom Shops": `§l§9=== Dynamic Shop Engine v3 ===§r

Modern Moneyz features Shop Engine v3, powered directly by Script API logic:

§lShop Features:§r
• §lLive Pricing:§r Real-time buy/sell pricing with support for bundle sizes and quantity multipliers.
• §lStock Modes:§r Choose between unlimited shop stock and tracked finite stock (listings sell out as players buy).
• §lCategories:§r Armory, Crafter's Shop, Farmer's Market, Library, Pet Shop, Workshop, and Custom Shops.

§lCreating Custom Shops (Admins):§r
• Open §6Moneyz Admin → Manage Shops§r.
• Create new shop categories or entire dynamic shops in-game.
• Define item IDs, display names, buy/sell prices, bundle amounts, and stock limits without touching JSON files!`,

    "§l§15. ATM & Resource Exchanges": `§l§9=== ATM & Resource Exchanges ===§r

§lATM Resource Exchange:§r
Exchange valuable ores and ingots directly for Moneyz or convert Moneyz back into items:
• §rNetherite Ingot = 1,000 Moneyz
• §rEmerald = 100 Moneyz
• §rDiamond = 75 Moneyz
• §rIron Ingot = 50 Moneyz
• §rGold Ingot = 25 Moneyz
• §rCopper Ingot = 10 Moneyz
• §rCoal = 5 Moneyz

§lUsing the ATM:§r
• Open §6ATM Exchange§r from the Moneyz Menu or use §6/moneyz:open moneyz:atm§r.
• Select the desired resource and choose §lResources → Moneyz§r or §lMoneyz → Resources§r.
• Adjust the bundle count slider and confirm.

§lManaging Exchanges (Admins):§r
• Admins can add, edit, or remove resource exchange rates in §6Moneyz Admin → Exchange Manager§r.`,

    "§l§16. Send Moneyz & Player Transfers": `§l§9=== Player-to-Player Money Transfers ===§r

§lDirect Transfers:§r
• Open §6Send Moneyz§r from the Moneyz Menu or run §6/moneyz:send§r.
• Select any online player currently on the server.
• Enter the desired transfer amount.

§lSafety & Audit:§r
• Transfers are validated synchronously through the Economy Service.
• Rejects invalid amounts, self-transfers, or transfers exceeding your available balance.
• All player-to-player transfers are recorded instantly to the §6Transaction Ledger§r for full server auditing.
• Transfers do not affect Treasury liquidity because funds move directly between player accounts.`,

    "§l§17. Jobs, Employment & Payroll": `§l§9=== Jobs, Employment & Payroll ===§r

§lApplying for Jobs:§r
• Open §6Jobs / Employment§r from the Moneyz Menu or run §6/moneyz:jobs§r.
• Command flow: §6/moneyz:job_apply§r then §6/moneyz:job <jobId>§r.
• To resign from your current position, run §6/moneyz:job_quit§r or use the Jobs menu.

§lBuilt-in Roster:§r
• Assistant, Banker, Builder, Cop, Delivery Person, Farmer, Fisher, Hotel Owner, Judge, Lawyer, Mayor, Pastor, Realtor.

§lBanker Payroll Payouts:§r
• Employed Bankers can run payroll for all active online workers via §6/moneyz:pay§r or the Payroll UI.
• Distributes configured salary payouts to all employed players on the server.

§lCustom Jobs (Admins):§r
• Manage job titles, application requirements, and salary amounts in §6Moneyz Admin → Job Manager§r.`,

    "§l§18. Real Estate Platform & Property Rentals": `§l§9=== Real Estate Platform & Property Rentals ===§r

§lMap-Independent Property Engine:§r
• Moneyz leaves property listings blank by default so world owners can create properties suited to their specific map builds.

§lProperty Features:§r
• Support for Residential houses, Commercial shopfronts, and custom estate listings.
• Purchase properties outright or rent them on a recurring rental schedule (default rent interval: 7 Minecraft days).
• Property owners can manage guest access, delegate manager permissions, or list properties for resale.
• Occupied properties cannot be rented or bought by other players until surrendered or checked out.

§lManaging Real Estate (Admins):§r
• Define new property locations, prices, rent amounts, and coordinates in §6Moneyz Admin → Property Manager§r or via §6/moneyz:realtor§r.`,

    "§l§19. Hotel Engine & Room Reservations": `§l§9=== Hotel Engine & Room Reservations ===§r

§lShort-Term Hotel Room Stays:§r
• The Hotel Engine manages room reservations and temporary occupancy.
• Book available hotel rooms via the Hotel UI or §6/moneyz:hotel§r.
• Reservation system prevents double bookings and manages guest access during active stays.
• Room reservations automatically expire and check out when the duration ends.

§lManaging Hotels (Admins):§r
• Register hotel properties, room numbers, nightly rates, and stay durations in §6Moneyz Admin → Property / Hotel Manager§r.`,

    "§l§110. Products, Bundles & Pet Shop": `§l§9=== Products, Bundles & Pet Shop ===§r

§lSpecialty Purchases:§r
• The Product Engine handles purchases beyond standard shop items, including item bundles, pet products, entitlements, and custom service deliverables.
• Access via §6Pet Shop§r (§6/moneyz:pets§r) or §6Products & Services§r (§6/moneyz:products§r).

§lDelivery Protection & Refunds:§r
• If a purchase cannot be delivered (for example, full player inventory or entity spawn blocked), Moneyz issues an automatic refund to prevent loss of funds.

§lProduct Management (Admins):§r
• Admins can create custom product offerings, prices, bundle contents, and pet items in §6Moneyz Admin → Product Manager§r.`,

    "§l§111. Daily Rewards & Quest Engine v2": `§l§9=== Daily Rewards & Quests ===§r

§lDaily Rewards:§r
• Claim a daily login reward bonus once every 24 hours (UTC reset) via §6Daily Rewards§r or §6/moneyz:open moneyz:daily_rewards§r.
• Default reward is §625 Moneyz§r (customizable by Admins in Settings).

§lQuest Engine v2:§r
• §lQuest Objectives:§r Ore mining, crop harvesting, hostile mob slaying, farm animal slaughtering, location patrols, and balance retention goals.
• §lPeaceful Compatibility:§r Hostile mob quests are automatically filtered out when world difficulty is Peaceful.
• §lProgress Rewards:§r Earn incremental payouts as you complete quest steps, plus a completion bonus.
• §lAbandoning Quests:§r Quests can be safely abandoned at any time without penalties via the Quests menu.`,

    "§l§112. Lucky Purchases & Chance Games": `§l§9=== Lucky Purchases & Chance Games ===§r

§lLucky Purchase:§r
• Pay a fixed Moneyz fee to draw a randomized item directly from the current Shop catalog.
• The reward item is drawn live from active shops—winning a physical item decrements actual shop stock!
• Protected by automatic refund logic if inventory space is insufficient.

§lChance Games:§r
• §l21 / Blackjack:§r Full Blackjack card game with Hit, Stand, Natural 21, Dealer AI, and Tie/Push handling.
• §lDice / Craps:§r Pass-line Craps rules (Come-out 7/11 win, 2/3/12 craps out, point establishment).
• §lSlots:§r Weighted 3-reel slot machine with customizable symbol payout tables.
• §lTest Your Luck:§r Direct probability roll against world-configured win percentage.
• §lEconomy Protection:§r Centralized stake validation prevents overlapping bets or double spending.`,

    "§l§113. Admin Tools, Settings & Setup Wizard": `§l§9=== Moneyz Admin Dashboard ===§r

Access requires the §6moneyzAdmin§r tag or operator permission. Open via §6/moneyz:admin§r.

§lAdministrative Features:§r
• §lBalance Manager:§r Give, take, set, or view any online player's Moneyz balance.
• §lPlayer Tag & Property Manager:§r Inspect permissions and toggle player feature flags (\`moneyzShop\`, \`moneyzATM\`, \`moneyzSend\`, \`moneyzDaily\`, \`moneyzQuest\`, \`moneyzLucky\`, \`moneyzChance\`).
• §lSetup Wizard:§r Interactive diagnostic and setup checklist for new worlds.
• §lSettings Editor:§r Global feature toggles, daily reward amounts, game win chance percentages, payout multipliers, and logging levels.
• §lEconomy Treasury & Reserves:§r Monitor liquid funds, deposit/withdraw treasury capital, and manage physical ATM reserves.`,

    "§l§114. Commands Suite & NPC Service Bindings": `§l§9=== Commands & NPC Services ===§r

§lFull Command Reference:§r
• §6/moneyz:setup§r - Initialize world economy & scoreboard
• §6/moneyz:menu§r - Open main Moneyz Menu
• §6/moneyz:balance [player]§r - Check player balance
• §6/moneyz:admin§r - Open Admin Management UI
• §6/moneyz:give <player> <amount>§r - Add Moneyz to balance
• §6/moneyz:take <player> <amount>§r - Remove Moneyz from balance
• §6/moneyz:set <player> <amount>§r - Set player balance directly
• §6/moneyz:open <serviceId>§r - Open specific Moneyz service
• §6/moneyz:services§r - List all registered service IDs
• §6/moneyz:shops§r - List all shop IDs
• §6/moneyz:npc <serviceId> [npc]§r - Bind service to targeted NPC
• §6/moneyz:npc_shop <shopId> [npc]§r - Bind specific shop to targeted NPC
• §6/moneyz:npc_clear§r / §6/moneyz:npc_shop_clear§r - Clear bindings from targeted NPC
• §6/moneyz:health§r - Run system diagnostic check
• §6/moneyz:reload§r - Reload shops and configuration
• §6/moneyz:transactions [count]§r - View recent transaction ledger

§lNPC Interactive Setup:§r
• Spawn or stand near a Minecraft NPC and execute §6/moneyz:npc moneyz:atm§r or §6/moneyz:npc_shop general§r.
• Binding multiple services to one NPC creates an automatic in-game service chooser when interacted with!`,

    "§l§115. System Diagnostics, Ledger & Troubleshooting": `§l§9=== Diagnostics, Ledger & Troubleshooting ===§r

§lTransaction Ledger:§r
• Tracks recent economy activity (up to 150 entries): transfers, shop purchases/sales, refunds, daily rewards, quest bonuses, game stakes, and admin adjustments.
• Viewable in-game via §6/moneyz:transactions§r or §6Moneyz Admin → Transaction Ledger§r.

§lSystem Health & Diagnostics:§r
• Run §6/moneyz:health§r or §6/moneyz:validate§r to verify system integrity.
• Displays Script API status, scoreboard health, online players, loaded shops, transaction ledger state, and config sync status.

§lTroubleshooting Common Issues:§r
• §lNPC does nothing:§r Stand near NPC and run §6/moneyz:npc_clear§r, then re-bind using §6/moneyz:npc <serviceId>§r.
• §lFeature missing from menu:§r Check §6Moneyz Admin → Settings§r and verify feature toggle is enabled and \`syncPlayers\` is set to true.
• §lCommand alias warning:§r Always use full namespaced command syntax (§6/moneyz:help§r, §6/moneyz:give§r, etc.).`,

    "§l§116. Developer SDK & Cross-Pack ScriptEvents API": `§l§9=== Developer SDK & Cross-Pack API ===§r

Moneyz Economy v2.0 provides a powerful platform for external behavior pack integrations:

§lGlobal SDK Namespace (Moneyz.*):§r
• §6Moneyz.economy§r - Balances, deposits, withdrawals, transfers
• §6Moneyz.shops§r / §6Moneyz.commerce§r - Shop Engine v3 catalog and transactions
• §6Moneyz.jobs§r - Employment registration, applications, payroll
• §6Moneyz.properties§r / §6Moneyz.reservations§r - Real estate, hotels, room bookings
• §6Moneyz.products§r / §6Moneyz.quests§r / §6Moneyz.rewards§r - Products, quests, reward delivery
• §6Moneyz.treasury§r - Treasury liquidity and resource reserve management
• §6Moneyz.events§r - System event listeners for transfers, balance changes, and quests
• §6Moneyz.ui§r - Custom menu item registration in Moneyz Menu

§lCross-Pack ScriptEvents API:§r
• Gateway channel: §6moneyz:api/request§r
• Request format: \`{"requestId": "req1", "op": "economy.balance", "player": "Steve"}\`
• Response channel: §6moneyz:api:response/<requestId>§r
• Supports balance checks, deposits, withdrawals, transfers, shop queries, job checks, real estate, quests, and service discovery.`
};

export function openHelp(player) {
    const form = new CustomForm(player, "§l§1Moneyz Economy Guide");
    form.header("Moneyz Economy v2.0 Comprehensive Guide");
    form.label("§7Select a topic below to view step-by-step instructions, commands, and feature guides.");

    for (const title of Object.keys(guideTopics)) {
        form.button(title, () => nav(form, () => helpPage(player, title)));
    }

    form.button("Back", () => nav(form, () => import("./moneyz_menu.js").then(m => m.main(player))));
    form.closeButton().show();
}

function helpPage(player, title) {
    const form = new CustomForm(player, title);
    form.label(guideTopics[title] ?? "No content available.");
    form.button("Back to Topics", () => nav(form, () => openHelp(player)));
    form.closeButton().show();
}
