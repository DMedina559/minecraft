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
