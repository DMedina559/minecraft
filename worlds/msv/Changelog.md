# MountainSide Villages Changelog

# 1.5.0
1. Updated Moneyz Economy to 1.10.1
2. Added new mini castle to Commu Village
3. Added underwater chamber to Square Town
4. Added new NPCs to some villages
5. Added various new ambient feature from recent Minecraft updates

# 1.4.0
1. Now uses direct copy of Moneyz Economy instead of a modified version
  - Using version 1.7.0
  - Updates will now be independent
2. Removed Moneyz Trader
3. NPC shops now use Dialogue commands
4. You can now selling items at the shop NPCs
5. Added full Moneyz Economy to Square Town
6. Added Help NPC to Villages
  - Square Town
  - Commu Village
  - Resh Village
7. Added Moneyz Menu
  - Adds ability to send Moneyz to other Players
  - Allows access to:
    - Shops
      - Armory
      - Farmer's Market
      - Library
      - Pet Shop
      - Workshop
    - ATM Services
    - Send Moneyz
    - Help
    - Credits
8. Added New Custom Item: Moneyz Menu
  - Allows Players to access the Moneyz Menu
  - Craftable in Crafting Table by combining 1 of each Resource
9. Added Admin Manager with Moneyz Menu
  - Players with a moneyzAdmin tag can access the Admin Menu 
  - Admins can View, Add, Set, or Remove online player Moneyz balances
  - Admins can View, Add, or Remove online Player’s tags
10. Added permissions levels to Moneyz Menu
  - Admins can control what players have access to
  - Players with moneyzShops moneyzATM moneyzSend can access their respective Menu
  - Can be auto added to players when they join the world
  - ATM and Send are enabled by default in Moneyz Menu
    - Can be toggled off by Admins
    - Admin can manually add or remove moneyzTags to individual online players
11. Added Armory
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
  - Accessible from Moneyz Menu
12. Each District has new Real Estate Address
13. Players that first join the world are now auto added to the Moneyz Scoreboard 
  - This fixes when a player tries to make a purchase when they have no score resulting in no feedback
14. Moneyz interactions now give sound feedback

# 1.3.1
1. Changed Moneyz Trader spawn rates

# 1.3.0
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
4. Added new Moneyz Trader
  - Trades most items that can be purchased from NPC shops for the same amounts/prices
  - Spawns naturally in the overworld (Please give any feedback on spawning/despawning)
  - Added /function help/selling
  - Includes Spawn Egg in creative
8. Fixed a few typos
9. Added missing Library Shop in Resh Village

# 1.2.0
1. Added Allay to Petshops
2. Added items to Workshops
3. Updated Moneyz Economy to 1.4.0
   - Added Workshop Kits
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
   - Added various /function help/ chat commands to help all players with Moneyz
      - Players can now run /function help/my_balance in chat to check their Moneyz balance
      - Players can run /function help/{SHOP} to get a list of all Items and Prices
      - Players can run /function help/jobs/{JOB} to get details about all jobs
      - Players can run /function help/exchange_rate to view the exchange rate between Moneyz and Resource
      - Players can run /function help/setup for instructions and recommendations
   - Fixed Salmon at Farmer’s Market

# 1.1.3
1. Updated Moneyz Economy to 1.0.4
  - Quitting Jobs now responds to the initiator
  - Failed purchases now respond with how much Moneyz is required to make the purchase and how much the initiator has
  - Fixed some oversights in the realtor commands related to purchasing houses
  - Fixed even more typos
  - Copper moneyz to resource has been fixed

# 1.1.2
1. Fixed more typos in Moneyz Economy pack

# 1.1.1
1. Fixed typos in Moneyz Economy pack

# 1.1.0
1. Added Mace with enchantments to AWT Chest in E4005 Basement
2. Added Wind Charge to E4005 Basement
3. Added delivery chest to all Residential buildings in Resh and Commu
4. Changed E400M to E4005
5. Fixed some blocks around the world
6. Revamped the Moneyz System (read below)
### Revamped Moneyz
Moneyz has been completely revamped. It no longer uses command blocks and now uses NPCs. All Moneyz commands have been completely moved to the included behavior pack ‘Moneyz Economy’. 

The move to NPCs and a Behavior Pack allows for easier maintenance, and fixes having to be in a certain radius of the command blocks. The move to a Behavior pack also allows it to easily be used in other worlds as well.

(You’ll need to activate the ‘Moneyz Economy’ behavior pack first. [This is so you can play with achievements if you decide not play with Moneyz])
1. Revamped Moneyz values
   - Moneyz has been completely revalued, and has expanded from just Emeralds and Diamonds. (Learn more about this in the Banks of Commu and Resh)
2. Added new job: Realtor
   - The new Realtor job allows players to easily sell and buy houses.
   - Added New realtor building to Commu and Resh
3. All salable items in the villages have been repriced and new items have been added to the various shops such as new pets in the Petshops and new foods in the Farmers Markets.
4. The Hotels in Commu and Resh now uses Moneyz
5. You’ll now be notified when you get paid by the banks, rent taken from the Realtors, when you can and can’t buy an item
6. Square Town now uses the Moneyz system through resources.
   - Added Resources to the Square Town Bank
7. Added ATMs to the train station where Moneyz is available
8. Residential buildings can now be purchased and sold with Moneyz in Commu and Resh (Learn more about this in the new Realestate Offices)


# 1.0.1
- Added warning to Spectator switch in Commu E400M basement
- Fixed backward rail going from Resh to MSS
- Fixed inconsistencies in Nest Base
- Fixed inconsistencies in DJ Village
- Fixed 1.21 Spawn Egg buttons in Commu E400M basement

# 1.0.0
- Initial Release

  MountainSide Villages is the new world I've been working on, which also contains my older worlds along with many new additions such as builds inspired by the Resident Evil Series and Survival worlds my brother and I created all in one mega world for you to explore.

   MountainSide Villages was built in 1.20 so you get the experience all the greatest above and under ground 