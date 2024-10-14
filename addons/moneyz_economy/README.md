# Downloading Addons
To download any content from this respitory click on the desired file you want and click on "Download Raw File"

If on Mobile, after clicking on the desired files tap the 3 dot menu in the top corner and press Download.

# Moneyz Economy
Moneyz Economy is a function pack for Minecraft Bedrock, that allows you to buy/sell items, apply for jobs and much more. Money Economy is also used in the world MountainSide Villages 1.4.0+

Moneyz Economy allows you to easily add a bustling economy to any of your worlds! Just simply spawn an npc and enter the dialogue or function command (e.g. `dialogue open @s @initiator workshop_buy` or `function petshop/pets/dog`), now you have a shops person to sell you items, houses, kits, or even give you a job. [^4]

### Why use NPCs and not Chat Commands or Command Blocks?
I decided to use NPC's for this pack as all commands are ran as `@initiator` instead of `@p` or `@s`. This means all commands are ran as the person interacting with the NPC and not any close player that happens to meet the requirements. (You can easily change this in any text editor.)

### To Get Started 

Moneyz Economy makes it easy to start using Moneyz in your world.

Just start your world with cheats and the behavior pack enabled and run these chat commands.

First run

`/function setup` [^5]

> [!NOTE]
> This will set up the Moneyz scoreboard and adds all players currently online to the scoreboard with a score of 0
>This will also give you an NPC Spawn Egg, and a Moneyz Menu item [^1] [^6]
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
> It is recommended to use the `dialogue` commands as this will allow NPC shops to automatically update with new items. `function` commands should only be used for manually selecting items to be sold/purchased. See bellow for available dialogues. [^4]

Do this for all your shops and now you have a working economy in your world.

> [!NOTE]
> You can follow the function commands here: [raw/functions](raw/functions)

> [!TIP]
> Alternatively you can run `/dialogue change @e[type=npc,r=5,c=1] {dialogue}` in chat while standing next to an NPC to set up a pre-configured dialogue and command buttons

### Available dialogues `dialogue open @s @initiator {dialogue}`: 

`armory`: Armor Weapon Tools Shop, supports `{armory_buy|sell}` [^1]

`atm`: ATM for Moneyz exchange

`banker`: Worker Pay and ATM Services 

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
Moneyz Economy adds a custom Moneyz Menu that allows Players to access various NPC shops by using the Moneyz Menu item. The Moneyz Menu item is craftable in the Crafting Table by putting 1 of each Resource in the grid, no shape required. [^3]

The Moneyz Menu also require Players to have moneyzTags to access certain features.[^1]

The following tags are supported:
- `moneyzAdmin`: Allows access to Admin Menu
- `moneyzShop`: Allows access to Shopping 
- `moneyzATM`: Allows access to Moneyz & Resource Exchange [^8]
- `moneyzSend`: Allows access to Sending feature [^8]

Admins can turn on/off the autoTagging feature from the Admin Menu. This will allow players to automatically have the enabled tags applied when they join the world. 

The Moneyz Menus allows Players direct access to:
- View their Moneyz balance
- Shops [^2]
  - Armory [^1]
  - Farmer's Market
  - Library
  - Pet Shop
  - Workshop
- ATM Services [^2]
- Send Moneyz [^2]
- Admin Menu [^1] [^2]
  - Manage Online Players Moneyz balances
  - Manage Online Players tags
  - Manage autoTagging 
- Help
- Credits

### Send Moneyz to other Players!
Moneyz Economy allows Players to send Moneyz directly to other Players straight from the Moneyz Menu.
Just select a Player from the dropdown menu and enter an amount to send. [^2][^3]

### Help Commands
Moneyz Economy comes with various help documentation to help all players setup and use Moneyz easily. [^7]

> [!IMPORTANT]
> World Owners/Admins should setup an NPC with the help dialogue in a general area for all players to get help with Moneyz. [^4]

To setup a Help NPC run `/dialogue change @e[type=npc,r=5,c=1] help` in chat while standing next to an NPC to set up a pre-configured NPC, or set up an NPC with `dialogue open @s @initiator help`

These commands include tips for World Owners/Admins settings up their shops, and allows players to check their Moneyz balance or the available items and prices in any shop.

## Dialogue VS Function
It is recommended to use the `dialogue` commands as this will allow NPC shops to automatically update with new items. `function` commands should only be used for manually selecting items to be sold/purchased. [^4]

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

[^1]: Requires 1.7.0+
[^2]: Requires moneyzTag in 1.7.0+
[^3]: Requires 1.6.1+
[^4]: Requires 1.6.0+
[^5]: Requires 1.2.0+
[^6]: Auto get NPC Spawn Egg requires 1.5.0+
[^7]: Requires 1.4.0+
[^8]: Enabled by Default.
  Requires rerunning `/function setup` if updating from a version before 1.7.0.