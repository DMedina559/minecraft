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
  -  Flowers:
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