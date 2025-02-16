# Downloading Addons
Download Moneyz Economy from the following link:

https://mcpedl.com/moneyz-economy/

# Moneyz Economy
Moneyz Economy is a function pack for Minecraft Bedrock, that allows you to buy/sell items, apply for jobs and much more. Money Economy is also used in the world MountainSide Villages 1.4.0+

Moneyz Economy allows you to easily add a bustling economy to any of your worlds! Just simply spawn an npc and enter the dialogue or function command (e.g. `dialogue open @s @initiator workshop_buy` or `function petshop/pets/dog`), now you have a shops person to sell you items, houses, kits, or even give you a job.

### Why use NPCs and not Chat Commands or Command Blocks?
I decided to use NPC's for this pack as all commands are ran as `@initiator` instead of `@p` or `@s`. This means all commands are ran as the person interacting with the NPC and not any close player that happens to meet the requirements. (You can easily change this in any text editor.)

### To Get Started 

Moneyz Economy makes it easy to start using Moneyz in your world.

Just start your world with cheats and the behavior pack enabled and run these chat commands.

First run

`/function setup`

> [!NOTE]
> This will set up the Moneyz scoreboard and adds all players currently online to the scoreboard with a score of 0
>This will also give you an NPC Spawn Egg, and a Moneyz Menu item
> 
> If you didn't get a Spawn Egg from the last command you can run `/give @p spawn_egg 1 51`
>
>You can also use `/summon npc ~ ~ ~`
>This will summon an NPC at your current position.

Interact with the NPC and click on `Edit Dialog`

Enter text you want the NPC to say, then go back and to the `Advanced Settings`

Change the command to `Button Mode` and enter a dialogue or function command from the pack

E.g. `dialogue open @s @initiator petshop_buy` or `function farmer/beef`

> [!TIP]
> It is recommended to use the `dialogue` commands as this will allow NPC shops to automatically update with new items. `function` commands should only be used for manually selecting items to be sold/purchased. See bellow for available dialogues.

Do this for all your shops and now you have a working economy in your world.

> [!NOTE]
> You can follow the function commands here: [raw/functions](raw/functions)

> [!TIP]
> Alternatively you can run `/dialogue change @e[type=npc,r=5,c=1] {dialogue}` in chat while standing next to an NPC to set up a pre-configured dialogue and command buttons

You can also run `/function setup/{shop}` to quickly spawn a preconfigured NPC.

### Available dialogues `dialogue open @s @initiator {dialogue}`: 

`armory`: Armor Weapon Tools Shop, supports `{armory_buy|sell}`

`atm`: ATM for Moneyz exchange

`banker`: Worker Pay and ATM Services 

`craftershop` Crafter's Shop, supports `{crafter_buy|sell}`

`farmers_market` Farmer's Market, supports `{farmer_buy|sell}`

`help`: Help Commands

`hotel`: Hotel Services

`jobs`: Employment Services

`library`: Library Shop, supports `{library_buy|sell}`

`petshop`: Pet store, supports `{petshop_buy|sell}`

`realtor`: Real Estate Management

`universal`: All Dialogues

`workshop`: Workshop, supports `{workshop_buy|sell}`

### Moneyz Menu
Moneyz Economy adds a custom Moneyz Menu that allows Players to access various NPC shops by using the Moneyz Menu item. The Moneyz Menu item is craftable in the Crafting Table by putting 1 of each Resource in the grid, no shape required.

The Moneyz Menu also require Players to have moneyzTags to access certain features.

The following tags are supported:
- `moneyzAdmin`: Allows access to Admin Menu
- `moneyzShop`: Allows access to Shopping 
- `moneyzATM`: Allows access to Moneyz & Resource Exchange
- `moneyzSend`: Allows access to Sending feature

Admins can turn on/off the autoTagging feature from the Admin Menu. This will allow players to automatically have the enabled tags applied when they join the world. 

The Moneyz Menus allows Players direct access to:
- View their Moneyz balance
- Shops
  - Armory
  - Crafter's Shop
  - Farmer's Market
  - Library
  - Pet Shop
  - Workshop
  - Custom Shop
- ATM Services
- Send Moneyz
- Daily Rewards
- Quest
- Feeling Lucky Menu
  - Lucky Purchase
  - Chance Minigames
    - Test Your Luck
    - 21
    - Dice Game
    - Slots
- Admin Menu
  - Manage Online Players Moneyz balances
  - Manage Online Players tags
  - Manage World/Player Properties
  - Manage Custom Shop Properties
  - Manage Settings
    - Set the Daily Reward Amount
    - Set Chance Games Settings
    - Manage Auto Tag Settings
    - Set Log Level
- Help
- Credits

### Custom Shop
It is possible to add custom items to a Custom Shop. World Owner/Admins can choose any item to add, and any price they choose!

### Send Moneyz to other Players!
Moneyz Economy allows Players to send Moneyz directly to other Players straight from the Moneyz Menu.
Just select a Player from the dropdown menu and enter an amount to send.

### Set Daily Rewards!
Moneyz Economy allows Players to redeem a set amount of Moneyz to their Balance! World Owners/Admins can set the dailyReward world property to any number which represents the amount of Moneyz a Player will get daily. After a Player redeems the Daily Reward they will get the Player Property lastDailyReward set to the current date in UTC YYYY-MM-DD format.

### Daily Quest
Players are able to complete simple task to earn moneyz in their balance.

Challenges include:
- Mine a number of resources
- Harvest a number of crops
- Slay some hostile mobs
- Slaughter a few farm animals
- Maintain a balance of Moneyz for an amount of time
- Patrol a set location for a set amount of time

### Feeling Lucky?
Moneyz Economy allows Players to access the Lucky Menu. With the Lucky Menu a Player can make a Lucky Purchase or play Chance Mini Games.

A Lucky Purchase lets the Player to make a purchase once a day in the Moneyz Menu that'll give them random items at different values from the various shops. After the Player makes a Lucky Purchase they will get the Player Property lastLuckyPurchase set to the current date in UTC YYYY-MM-DD format. The once a day limit can be disabled in the Settings Menu.

Chance Games allows a Player to put an amount of Moneyz at stake for a chance to win more Moneyz. The Player will be able to enter an amount of Moneyz to stake. This can be multiplied if they win a chance game or lost if they lose the game. World Owners/Admins must set the World Properties chanceX and chanceWin. These can be set in the Settings Menu.

- The chanceX World Property sets the multiplier for the stake amount. For example: if a places a stake for 15 Moneyz, the chanceX property is set to 2 and they win a game they will win 30 Moneyz. This is set to 0 by default resulting in 0 Moneyz won.
- The chanceWin World Property set the chances a Player can win. For example if chanceWin is set to 50, the Player has a 50% chance to win a Chance Game. This is set to 0 by default resulting in 0% chances to win.

### Help Dialogue
Moneyz Economy comes with various help documentation to help all players setup and use Moneyz easily.

> [!IMPORTANT]
> World Owners/Admins should setup an NPC with the help dialogue in a general area for all players to get help with Moneyz.

To setup a Help NPC run `/dialogue change @e[type=npc,r=5,c=1] help` in chat while standing next to an NPC to set up a pre-configured NPC, or set up an NPC with `dialogue open @s @initiator help`

The Help Dialogue includes valuable info/tip for World Owners/Admins settings up their shops, and allows players using the economy.

## Dialogue VS Function
It is recommended to use the `dialogue` commands as this will allow NPC shops to automatically update with new items. `function` commands should only be used for manually selecting items to be sold/purchased.

Dialogue commands allow NPCs to update with new items as they release. World Owners/Admins no longer need to enter each individual function command as they're already preconfigured with the dialogue command. 

NPCs have a 6 button limit but `dialogue` commands can bypass this by allowing the NPC to have 'multiple menus'. With `dialogue` commands you no longer need multiple NPCs for 1 shop. 1 NPC can do it all!

If you're updating from a previous version and want to use the new `dialogue` command with your existing shops you an easily run `/dialogue change @e[type=npc,r=5,c=1] {dialogue}` in chat while standing next to an NPC to upgrade it hassle free.

> [!TIP]
> Admins can also open dialogues directly by running `/dialogue open @s @s {dialogue}` in chat. 
>
> Dialogues are also used by the Moneyz Menu.

### Google Sheets Link:
Below is a link to a table that list all available items and prices

https://docs.google.com/spreadsheets/d/1TG4Ol5z_8U7mEJlSLx4I2LBmPVcJ0Aawu3_o_ac4xvU

### Shout out to SoullessReaperYT for their YouTube video on custom menus and providing a GUI template:
https://www.youtube.com/watch?v=6sjZkGPCF5A