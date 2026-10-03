# V1.0.0

1. Initial Release

# V1.1.0

1. Removed MSV references
2. Fixed a few typos

# 1.2.0
1. Added scoreboard set up file
   - Run /function setup to set up a Moneyz Scoreboard with the scores in the pause menu
2. Fixed more typos

# 1.3.0
1. Added Allay to Petshop
2. Quitting Jobs now responds to the initiator
3. Failed purchases now respond with how much Moneyz is required to make the purchase and how much the initiator has
4. Fixed some oversights in the realtor commands related to purchasing houses
5. Fixed even more typos
6. Copper moneyz to resource has been fixed

# 1.4.0
1. Added Workshop Kits
   - Every Kit comes with a Colored Shulker Box
   - Every AWT Kit comes with Fully Maxed Enchantments
   - Added AWT Kits (Armor Weapon Tools)
     - Added Netherite AWT Kit
     - Added Diamond AWT Kit
     - Added Iron AWT Kit
     - Added Gold AWT Kit
     - Added Stone AWT Kit
     - Added Wood AWT Kit
   - Added Normal Kits
     - Added Smithing Templates Kit
     - Added  Brewing Kit
     - Added  Banner Kit
     - Added  Dye Kit
     - Added  Pottery Sherds Kit
     - Added  Wood Kit
2. Added various /function help/ chat commands to help all players with Moneyz
   - Players can now run /function help/my_balance in chat to check their Moneyz balance
   - Players can run /function help/{SHOP} to get a list of all Items and Prices
   - Players can run /function help/jobs/{JOB} to get details about all jobs
   - Players can run /function help/exchange_rate to view the exchange rate between Moneyz and Resource
   - Players can run /function help/setup for instructions and recommendations
3. Fixed Salmon at Farmer’s Market

# 1.4.1
1. Running /function setup now gives feedback to the player
2. Improved a lot of the help commands to be more clear and descriptive
3. Moved recommendations to it's own command: /function help/recommend
4. removed recommendations from various help commands for a cleaner experience

# 1.5.0
1. Added /function help to list all help commands
2. Added new Workshop items
  - Added Conduit
  - Added Horse Armor
  - Added End Crystal
  - Added Ender Pearl
  - Added Fireworks (Flight 3)
  - Added Nether Star
  - Added Shuker Shell
  - Added Totem of Undying
  - Added Wind Charge
3. Added new Farmer's Market items
  - Added Cake
  - Added Cookie
  - Added Pumpkin Pie
4. Added new Moneyz Trader
  - Trades most items that can be purchased from NPC shops for the same amounts/prices
  - Spawns naturally in the overworld (Please give any feedback on spawning/despawning)
  - Added /function help/selling
  - Includes Spawn Egg in creative
5. Added new recommendations
6. Setup file now gives Player feedback and gives NPC Spawn Egg to player
8. Fixed a few typos

# 1.5.1
1. Changed Moneyz Trader spawn rates

# 1.6.0
1. Removed Moneyz Trader
2. Added Dialogue commands
  - Setup NPCs with `dialogue open @s @initiator {shop}_{buy|sell}`
      - For example `dialogue open @s @initiator petshop_sell`
    - Alternatively you can run `/dialogue change @e[family=npc,r=5,c=1] {dialogue}` in chat while standing next to an NPC to setup a pre-configured dialogue and command buttons
      - For example `/dialogue change @e[family=npc,r=5,c=1] atm`
      - World Owners/Admins can also update their existing NPCs with this commands
  - This will be the preferred way to setup your NPCs moving forward
  - Allows new items to be added to shops without having to manually add it
  - Allows 1 NPC for all items in a shop instead of multiple
  - Available dialogues `dialogue open @s @initiator {dialogue}`:
    - `atm`: ATM for Moneyz exchange
    - `banker`: Worker Pay and ATM Services 
    - `farmers_market` Farmer's Market, supports `{farmer_buy|sell}`
    - `help`: Help Commands
    - `hotel`: Hotel Services
    - `jobs`: Employment Services
    - `library`: Library Shop, supports `{library_buy|sell}`
    - `petshop`: Pet store, supports `{petshop_buy|sell}`
    - `realtor`: Real Estate Management
    - `universal`: All Dialogues
    - `workshop`: Workshop, supports `{workshop_buy|sell}`
  - Shops can still be setup manually with the usual `/function {shop}/` commands
3. Selling items is now done through the shop NPCs
  - `/function {shop}/sell/{item}`
  - `dialogue open @s @initiator {shop}_sell`
4. Moved most help commands to `dialogue open @s @initiator help`
  - It is recommended to setup an NPC with this command and read through the menus, and to allow players to get help with Moneyz in general
5. Updated Help documentation for new dialogue commands

# 1.6.1
1. Added Moneyz Menu using the Scripting API
  - Adds ability to send Moneyz to other Players
  - Allows access to:
    - Shops
      - Farmer's Market
      - Library
      - Pet Shop
      - Workshop
    - ATM Services
    - Send Moneyz
    - Help
    - Credits
2. Added New Custom Item: Moneyz Menu
  - Allows Players to access the Moneyz Menu
  - Craftable in Crafting Table by combining 1 of each Resource
3. Fixed Selling Ender Pearls
4. Fixed Buying and Selling Gold Horse Armor
5. Fixed Various Typos and Grammar

# 1.7.0

1. Added Admin Manager to Moneyz Menu
  - Players with a moneyzAdmin tag can access the Admin Menu 
  - Admins can View, Add, Set, or Remove online player Moneyz balances
  - Admins can View, Add, or Remove online Player’s tags 
  - Rerun function setup to be added as a moneyzAdmin
2. Added permissions levels to Moneyz Menu
  - Admins can control what players have access to
  - Players with moneyzShops moneyzATM moneyzSend can access their respective Menu
  - Can be auto added to players when they join the world
  - It's recommended to rerun /function setup in chat to setup auto management of moneyzTags that admins can toggle on or off individually
  - ATM and Send are enabled by default in Moneyz Menu
    - Can be toggled off by Admins
    - Admin can manually add or remove moneyzTags to individual online players
3. Added Armory
  - Added Armory Sets
    - Come fully Enchanted
    - Netherite
    - Diamond 
    - Iron
    - Gold
    - Chainmail 
    - Leather
  - Added Swords
    - Come fully Enchanted
    - Netherite
    - Diamond 
    - Iron
    - Gold
    - Stone 
    - Wood
  - Added Weapons
    - Come fully Enchanted 
    - Bow
    - Crossbow
    - Mace
    - Riptide Trident
    - Trident
  - Added Pickaxes
    - Come fully Enchanted
    - Netherite
    - Diamond 
    - Iron
    - Gold
    - Stone 
    - Wood
  - Added Axes
    -  Come fully Enchanted
    - Netherite
    - Diamond 
    - Iron
    - Gold
    - Stone 
    - Wood
  - Added Shovels
    - Come fully Enchanted
    - Netherite
    - Diamond 
    - Iron
    - Gold
    - Stone 
    - Wood
  - Added Hoes
    -  Come fully Enchanted
    - Netherite
    - Diamond 
    - Iron
    - Gold
    - Stone 
    - Wood
  - Added Horse Armor
    -  Come fully Enchanted
    - Diamond 
    - Iron
    - Gold
    - Leather
  - Added Misc
    - Come fully Enchanted when applicable
    - Arrows
    - Elytra
    - Fishing Rod
    - Shield
    - Totem of Undying 
    - Turtle Shell
  - Added `armory` dialogue
    - Supports `{armory_buy|sell}`
  - Accessible from Moneyz Menu
  - Added to `help` dialogue & `/function help/armory`
4. BREAKING CHANGES: WORKSHOP
  - Removed AWT Kits
  - Moved Totem of Undying and Horse armor to Armory shop
  - Workshop NPCs that were manually setup with function commands need to be updated 
    - NPCs set up with dialogue commands don't require updating 
5. Added Moneyz Menu Item to Workshop
6. Each District Real Estate Address go up to 20 now
7. Players that first join the world are now auto added to the Moneyz Scoreboard 
  - This fixes when a player tries to make a purchase when they have no score resulting in no feedback
8. Library XP now cost 35 Moneyz 
9. Workshop XP now cost 1000 Moneyz
10. Wind Charge and Fireworks buy and sell now give/take 10 instead of 64
11. Most interactions now give sound feedback
12. Setup no longer puts Moneyz score in pause menu, players can view their score anywhere anytime in the Moneyz Menu
13. Fixed Typos and Grammar

# 1.8.0
1. Added New Shop: Crafter's Shop
  - Blocks:
    - Dirt
    - Gravel
    - Red Sand
    - Sand
  - Stones:
    - Andesite
    - Blackstone
    - Cobbled Deepslate
    - Cobblestone
    - Deepslate
    - Diorite
    - End Stone
    - Granite
    - Netherrack
    - Stone
  - Flowers:
    - Allium
    - Azure Bluet
    - Blue Orchid
    - Cornflower
    - Dandelion
    - Flowering Azalea
    - Lilac
    - Lilly of the Valley
    - Eyeblossom (Open) (Wont be added to craftershop dialogue until official release)
    - Orange Tulip
    - Oxeye Daisy
    - Peony
    - Pink Petals
    - Pink Tulip
    - Pitcher Plant
    - Poppy
    - Red Tulip
    - Rose Bush
    - Spore Blossom
    - Sunflower
    - Torchflower
    - White Tulip
    - Wither Flower
  - Added /help craftershop
  - Added Crafter's Shop to Moneyz Menu
  - Added `craftershop` dialogue
    - Supports `crafter_{buy|sell}`
2. Added new Workshop items:
  - Logs:
    - Acacia Log
    - Birch Log
    - Cherry Log
    - Crimson Stem
    - Dark Oak Log
    - Jungle Log
    - Mangrove Log
    - Oak Log
    - Pale Oak Log (Wont be added in workshop dialogue until official release)
    - Spruce Log
    - Warped Stem
  - Planks:
    - Acacia Planks
    - Birch Planks
    - Cherry Planks
    - Crimson Planks
    - Dark Oak Planks
    - Jungle Planks
    - Mangrove Planks
    - Oak Planks
    - Pale Oak Planks (Wont be added in workshop dialogue until official release)
    - Spruce Planks
    - Warped Planks
  - Misc:
    - Bundles
    - Phantom Membrane
3. New Farmer's Market items:
  - Plantables:
    - Bamboo
    - Beetroot Seeds
    - Brown Mushroom
    - Cactus
    - Chorus Flower
    - Cocoa Beans
    - Crimson Fungus
    - Melon Seeds
    - Nether Wart
    - Pitcher Pod
    - Pumpkin Seeds
    - Red Mushroom
    - Sea Pickle
    - Torchflower Seeds
    - Wheat Seeds (Cheaper than Pet Shop)
  - Growables:
    - Pumpkin
  - Misc:
    - Bowl
4. BREAKING CHANGE: Workshop
  - Removed Wood Kit
5. Most damaged items can be now be sold
6. Pet Shop Sell Supplies now gives Sound Feedback
7. Fixed Chorus Fruit typos

# 1.8.1
1. Added Pale Oak and Eye Blossom to Dialogues
2. Added Missing Kelp Buy from 1.8.0 release
3. Fixed Planks typos in Dialogue
4. Fixed Gravel Sell
5. Fixed some typos in Help Dialogue

# 1.9.0
1. Added Chance Games
  - Players can put a stake for a chance to win more Moneyz
  - Games:
    - Test Your Luck
    - 21 (Blackjack)
    - Dice Game (Craps)
    - Slots
  - Requires moneyzChance Player property set to true
  - Requires chanceX world property to be set to any number
    - Sets the multiplier for the amount a Player stakes in a Chance Game
      - For example if a player puts a stake for 20 Moneyz and the chanceX world property is set to 2 the player can earn 40 Moneyz
      -  Defaults to 0 resulting in 0 Moneyz won
  - Requires chanceWin world property to be set to any number 1 - 100
    - Control’s how likely it is for a Player to win a Chance Game
    - Defaults to 0 which means 0% win chance
2. Added Lucky Purchases
  - Players can make a purchase to receive random items at different values from any shop
  - Players can only make one Lucky Purchase a day
    - The world property oneLuckyPurchase can be set to false to disable this and allow Players to make as many Lucky Purchases as they want
     - After a Player makes a Lucky Purchases they will get the Player property lastLuckyPurchase set to the current date in UTC YYYY-MM-DD format
  - Requires the moneyzLucky Player property set to true
3. Added Daily Rewards
  - Players can receive a set amount of Moneyz in their balance daily
  - Requires the world property dailyReward to be set to any number which sets the amount of Moneyz players can receive Daily.
    - Defaults to 0
  - Once a Player receives a Daily Reward they will get the Player Property lastDailyReward set to the current date in UTC YYYY-MM-DD format
  - Requires the Player property moneyzDaily set to true
4. Migrated moneyzTags Player Tags (moneyzShop, moneyzATM, moneyzSend) and moneyzAutoTag scoreboard to World Properties
  - moneyzAdmin will remain a Player Tag
  - moneyzShop, moneyzATM, moneyzSend Player and World Properties can be set to true or false
  - Player Properties control what they can access in the Moneyz Menu
    - To manually control players properties the world property syncPlayers must be set to false
  - World Properties control whether to auto sync these properties to the Player.
    - Requires the world property syncPlayers to be set to true 
    - This will be set to true by default and if any of the previous scores in moneyzAutoTag is above 0
    - If all of the previous scores in moneyzAutoTag is 0 syncPlayers will be set to false
    - World Properties will be auto created if they don't exist already
    -  syncPlayers, moneyzATM, and moneyzSend will be set to true by default
    - 1.9.0 will look for the moneyzAutoTag scoreboard and auto set the appropriate world properties with their appropriate value
      - For example if you had the moneyzShop autoTag enable before 1.9.0 it will be auto set to true in the world properties and also set the world property syncPlayers to true
    - After all moneyzAutoTag values have been set the scoreboard will be auto removed
      - This will NOT affect the Moneyz scoreboard which is separate
5. Rearranged Admin Menu
  - Player Tag Screens (Add/Remove) have been merged
  - Added Properties menu
    - Can add/view/modify players and world properties 
    - World Properties can be fully cleared
  - Auto Tag menu has been moved to Settings
6. Added Settings Menu
  - Players with the moneyzAdmin tag can easily be set dailyReward, chanceX and chanceWin values
  - Added Log settings
   - Admins can set the log level in the behavior pack to different levels for debug purposes
     - This allows admins to see what who and why something happens in the .js scripts
   - logLevel world property is auto set WARN
     - Setting to DEBUG can spam the creator log if  the syncPlayers world property is set to true
   - Will only affect the log level in the Moneyz Economy behavior pack .js files
   - Requires Creator Log settings in the Minecraft settings to be enabled and set to INFO
     - Note: This will also show logs for other behavior packs also installed/running
7. Changed Moneyz Item to use the Emerald texture
8. Revamped logging throughout the pack .js Files
9. Cleaned up .js files
10. Updated dependencies to latest versions

# 1.10.0
1. Added Quest
    - Quest allow Players to complete simple task to earn some Moneyz in their balance
    - There are 3 diifferent Quest per day
      - Players can do 1 of each quest per day
    - Requires moneyzQuest property set to true to access in Moneyz Menu
    - More info in help dialogue
2. Added Custom Shop
    - Admins can add any item to the custom shop using world properties
      - This allows items form other addons aswell
    - Admins can learn more in the help dialogue
3. Admins can now setup NPCs to open specific js menus
    - Admins can learn more in the help dialogue
4. Reworked Help Dialogue
    - Run `/dialogue change @e[type=npc,r=5,c=1] help` while standing next to your Help NPC to update
5. Reworked World/Player Property Menus
    - It's now possible to remove indivial properties from players/world
6. Some interactions now give sound feedback in throughout the js files

# 1.10.1
1. Added Various Cooked meats to Farmer's Market
2. Added Various Lighting Blocks/Items to Crafter's Markrt
3. All Moneyz Menu Options are now enabled by default
4. Quest now uses a seed that can be overried by the World Property dailyQuestSeed
5. Updated Help NPC setup function
6. Better handle chanceWin in 21 Game?
7. Fixed Duplicate Hotel messaging
8. Fixed Correct Amount of Netherrack
9. Fixed Pumpkin Buy
10. Fixed Pumpkin Sell messaging
11. Fixed Crimson Typos

# 2.0.0
1. Rebuilt Moneyz Economy for the 2.0 release
   - Reworked major legacy systems to use the newer Scripting API based systems
   - Reduced reliance on legacy function, tag, scoreboard, and dialogue based systems where newer systems are available
   - Added migration/compatibility support for legacy Moneyz worlds and systems

2. Reworked Shops
   - Shops can now be created and managed dynamically instead of requiring individual function commands for every item
   - Supports both Items and Blocks using their Minecraft/Add-On identifiers
   - Admins can create custom Shops and configure their contents in-game
   - Admins can set Buy and Sell prices for individual Shop items
   - Shops can support Buy only, Sell only, or Buy and Sell items
   - Added support for custom Add-On Items and Blocks
   - Added support for item quantities/bundles
   - Non-stackable bundle items are now correctly delivered as multiple individual stacks
   - Reworked Shop menus to make Buy and Sell prices easier to read
   - NPCs can be assigned directly to specific Shops
   - NPCs can show only the Shop or Shops assigned to them
   - Reworked Shop transactions to use the newer transaction systems
   - Shop purchases and sales now support atomic transaction handling and rollback
   - Added better handling for insufficient Moneyz, inventory failures, and failed transactions

3. Added Dynamic Pricing Systems
   - Added pricing support for Shop items based on configured values
   - Added reusable Pricing and Fee systems for other Moneyz features and Add-Ons
   - Added support for Buy/Sell price calculations through the Moneyz API
   - Pricing systems can be used by custom Shops and other public API integrations

4. Reworked Moneyz Menu
   - Updated the Moneyz Menu Item for the newer 2.0 systems
   - Moneyz Menu Item now opens the same Moneyz Menu service used by commands and NPCs
   - `/moneyz:setup` gives the Moneyz Menu Item if the Player does not already have one
   - Re-running setup will not duplicate the Moneyz Menu Item
   - Added `/moneyz:give_menu` to give yourself a replacement Moneyz Menu Item
   - Moneyz Menu Item includes descriptive lore
   - Moneyz Menu Item is not kept on death
   - Removed the need for Moneyz to override `minecraft:player`

5. Added Moneyz Services
   - Added a reusable service system for opening Moneyz menus and features
   - Commands, NPCs, Items, and other Add-Ons can use the same Moneyz services
   - NPCs can be configured to open specific Moneyz menus directly
   - Added support for NPCs opening specific Shops instead of only generic Shop menus
   - Added services for Moneyz Menu, Shops, ATM, Banking, Send Moneyz, Jobs, Real Estate, Hotels, Help, Admin tools, and other supported systems
   - Other Add-Ons can build their own integrations using the Moneyz service/API systems

6. Reworked NPC Support
   - NPCs can now be configured directly for specific Moneyz services
   - NPCs can open specific Shop IDs
   - NPCs can be limited to selected Shops or services
   - Added NPC support for ATM services
   - Added NPC support for Send Moneyz
   - Added NPC support for Jobs
   - Added NPC support for Real Estate
   - Added NPC support for Hotels
   - Added NPC support for Help
   - Added NPC support for Admin menus where the Player has permission
   - Legacy NPC/dialogue workflows can continue to be migrated to the newer service system

7. Reworked Admin Menus
   - Expanded Admin tools for managing Moneyz systems in-game
   - Added management for Shops and Shop items
   - Added management for Jobs
   - Added management for Real Estate and Hotels
   - Added management for Moneyz Treasury settings
   - Added management for newer Moneyz services and configuration
   - Improved access to Moneyz system information and settings without requiring manual function editing

8. Reworked Help
   - Reworked Help into a larger multi-page in-game guide
   - Added updated Player instructions
   - Added updated Admin/World Owner instructions
   - Added NPC setup information
   - Added Shop setup information
   - Added Job setup information
   - Added Real Estate and Hotel setup information
   - Added Treasury and Reserve Economy information
   - Added Developer/Public API information
   - Updated Help for the newer command and menu based Moneyz systems

9. Reworked Setup
   - `/moneyz:setup` now uses the newer Moneyz setup systems
   - Setup initializes required Moneyz systems for a new world
   - Setup grants required legacy/setup items where applicable
   - Setup gives the Moneyz Menu Item without creating duplicates
   - Improved compatibility between setup, migration, and newer Moneyz systems
   - Real Estate starts blank and requires Admins or other Add-Ons to register world-specific Properties

10. Reworked Jobs
   - Migrated Jobs away from relying only on legacy tags/functions
   - Jobs can now be managed through newer Moneyz menus, commands, NPCs, and API systems
   - Added Job application support through the newer systems
   - Added Job join, leave, and current Job support
   - Maintained legacy compatibility where required for existing worlds
   - Reworked Job pay to integrate with the newer Economy transaction systems
   - Jobs can participate in Treasury-backed payouts when Treasury mode is enabled

11. Reworked Real Estate
   - Real Estate now starts with no preconfigured world Properties
   - Admins can configure Properties based on the layout of their own world
   - Added reusable Property registration and management systems
   - Added Property ownership support
   - Added Property purchase and sale support
   - Added Property rental support
   - Added Property access control
   - Property Owners can grant and revoke access for other Players
   - Ownership and tenancy can be checked by other Moneyz systems and Add-Ons
   - Added support for custom Property metadata
   - Added support for namespaced Property IDs for third-party Add-Ons
   - Property purchases and system buy-backs can integrate with the Moneyz Treasury

12. Reworked Hotels and Reservations
   - Added reusable Hotel registration support
   - Other Add-Ons can register their own Hotels/rooms with Moneyz
   - Added reservation creation, lookup, availability, cancellation, and checkout systems
   - Added protection against invalid/double bookings
   - Hotel payments can integrate with the Moneyz Treasury
   - Hotel/Reservation systems are available through the public Moneyz API

13. Added Moneyz Treasury
   - Added a world-level Treasury for system Moneyz
   - Added Classic Economy mode
     - Uses unlimited system liquidity similar to previous Moneyz versions
   - Added Treasury Economy mode
     - System payouts require enough Moneyz in the Treasury
   - Added Reserve Economy mode
     - Uses the Treasury with tracked Resource reserves
   - System purchases can add Moneyz to the Treasury
   - System payouts can remove Moneyz from the Treasury
   - Player-to-Player transfers do not create or destroy Treasury Moneyz
   - Transactions that require more Moneyz than the Treasury contains are rejected
   - Failed Treasury transactions are designed to leave Player Moneyz, Items, ownership, and Treasury values unchanged
   - Added Treasury statistics for inflow, outflow, issuance, and other Economy information
   - Added Treasury management to the Admin Menu
   - Classic mode remains available for worlds that do not want a backed Economy

14. Added Resource Reserve Economy
   - Reserve Economy can track Resources deposited into Moneyz
   - Resource deposits can add physical Resource quantities to Moneyz reserves
   - Resource withdrawals require the Resource to exist in the reserve
   - Moneyz will not generate an unavailable Resource when Reserve Economy enforcement is enabled
   - Added Resource reserve counts and value information
   - Added API support for adding, removing, listing, and checking Resource reserves

15. Reworked Economy Transactions
   - Expanded transaction handling across Moneyz systems
   - Added atomic transaction handling for supported operations
   - Added rollback protection for failed operations
   - Improved handling for Shop purchases and sales
   - Improved handling for Moneyz transfers
   - Improved handling for Property transactions
   - Improved handling for Hotel bookings
   - Improved handling for Treasury deposits and payouts
   - Added transaction history/recording systems for supported operations
   - Improved protection against partial transactions where Moneyz or Items could otherwise be lost

16. Expanded Moneyz Public API 2.0
   - Moneyz 2.0 includes a public API for other Behavior Packs/Add-Ons
   - Added Economy APIs
   - Added Account APIs
   - Added Transaction APIs
   - Added Treasury APIs
   - Added Resource Reserve APIs
   - Added Shop/Commerce APIs
   - Added Product APIs
   - Added Job APIs
   - Added Quest/Reward APIs
   - Added Real Estate APIs
   - Added Hotel/Reservation APIs
   - Added Permission/Policy APIs
   - Added Pricing/Fee APIs
   - Added Merchant APIs
   - Added Audit/Metrics APIs
   - Added Extension discovery APIs
   - Added Moneyz Service APIs
   - Added NPC Service APIs
   - Added Event APIs
   - Added ScriptEvent/API gateway support for cross-pack integrations
   - Public APIs allow other Add-Ons to build on Moneyz without modifying Moneyz source files

17. Added Real Estate Public API
   - Other Add-Ons can register their own Properties
   - Other Add-Ons can register their own Hotels
   - Added Property list/get/register/unregister operations
   - Added Property ownership queries
   - Added Property purchase/sale/rental operations
   - Added Property access check/grant/revoke operations
   - Added Hotel registration/list operations
   - Added Reservation availability and management operations
   - Supports provider/namespaced IDs to reduce conflicts between Add-Ons
   - Supports custom metadata for Add-On specific Property information

18. Expanded Public API Discovery and Observability
   - Added Metrics snapshot support
   - Added Audit recent/query support
   - Added public Config get/list support
   - Added Permission discovery
   - Added Merchant list/get support
   - Added Extension discovery
   - Added Currency discovery
   - Added Pricing calculation support
   - Added Fee calculation support
   - Privileged mutation operations remain controlled instead of exposing unrestricted remote Admin access

19. Reworked Commands
   - Added newer Moneyz custom commands for supported systems
   - Commands can use the same underlying services as Moneyz menus and NPCs
   - Namespaced Moneyz commands can be used when command aliases conflict with other Add-Ons
   - Improved command/API handling for non-Player command origins where supported
   - Improved compatibility with GameTest and cross-pack command/API requests

20. Added Comprehensive GameTest Coverage
   - Added a separate Moneyz 2.0 GameTest pack for testing the production pack
   - GameTests do not require custom in-game structures for the supported test suites
   - Added tests for Moneyz Economy APIs
   - Added tests for balances, deposits, withdrawals, transfers, and invalid operations
   - Added tests for Shops and Exchanges
   - Added tests for Jobs and legacy Job migration
   - Added tests for Entitlements
   - Added tests for Properties
   - Added tests for Hotels and Reservations
   - Added tests for Quests
   - Added tests for setup and legacy migration
   - Added tests for the public API gateway
   - Added stress tests for API requests
   - Added Treasury unit and integration tests
   - Added Treasury Shop purchase/sale tests
   - Added Treasury insolvency/atomicity tests
   - Added Reserve Economy tests
   - Added Real Estate public API tests
   - Added Property access security tests
   - Added Hotel registration/availability tests
   - Added Public API discovery/observability tests
   - Full current internal test suite passes all 115 required tests

21. Improved Legacy Migration
   - Added migration support for legacy Job tags and newer Job state
   - Added compatibility for legacy Job application behavior where required
   - Improved migration/setup idempotency
   - Reworked legacy systems to use newer Moneyz services where practical
   - Existing worlds can continue using Classic Economy behavior while migrating to newer 2.0 features

22. Improved Stability and Compatibility
   - Removed unsupported `structuredClone` usage
   - Fixed invalid Entity references causing Dynamic Property errors
   - Fixed invalid Player references in Quest and HUD systems
   - Fixed API gateway handling for non-Player request origins
   - Fixed API request timeout issues during GameTests
   - Improved handling for removed/invalid simulated Players in Metrics
   - Improved Treasury test isolation
   - Fixed non-stackable bundle delivery
   - Improved transaction rollback and failure handling
   - Improved setup and service availability handling
   - Cleaned up production pack files that were only required for development/testing

23. Added/Updated Documentation
   - Added a detailed GitHub README for Moneyz Economy 2.0
   - Added Player usage information
   - Added Admin/World Owner setup information
   - Added Shop configuration information
   - Added NPC configuration information
   - Added Jobs information
   - Added Real Estate/Hotel information
   - Added Treasury/Reserve Economy information
   - Added Developer/Public API documentation
   - Added examples for other Add-Ons building on Moneyz

24. BREAKING CHANGES: Moneyz 2.0
   - Moneyz 2.0 replaces many legacy function-only workflows with newer Script/API based systems
   - World-specific Real Estate is no longer expected to be preconfigured and should be created by Admins or registered by Add-Ons
   - New integrations should use Moneyz Services and the Moneyz Public API instead of depending on internal implementation files
   - NPCs should use the newer service/menu bindings where possible
   - Legacy compatibility and migration support is included where practical, but Add-On creators should update integrations to the Moneyz 2.0 Public API

