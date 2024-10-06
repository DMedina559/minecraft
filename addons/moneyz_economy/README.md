# Downloading Addons
To download any content from this respitory click on the desired file you want and click on "Download Raw File"

If on Mobile, after clicking on the desired files tap the 3 dot menu in the top corner and press Download.

# Moneyz Economy
Moneyz Economy is a function pack for Minecraft Bedrock, that allows you to buy/sell items, apply for jobs and much more. A modified version is also used in the world MountainSide Villages 1.1.0+

Moneyz Economy allows you to easily add a bustling economy to any of your worlds! Just simply spawn an npc and enter the dialogue or function command (e.g. `dialogue open @s @initiator workshop_buy` or `function petshop/pets/dog`), now you have a shops person to sell you items, houses, kits, or even give you a job.

### Why use NPCs and not Chat Commands or Command Blocks?
I decided to use NPC's for this pack as all commands are ran as `@initiator` instead of `@p` or `@s`. This means all commands are ran as the person interacting with the NPC and not any close player that happens to meet the requirements. (You can easily change this in any text editor.)

### To Get Started 

Moneyz 1.6.0+ makes it easy to start using Moneyz in your world.

Just start your world with cheats and the behavior pack enabled and run these chat commands.

First run

`/function setup`

This will set up the Moneyz scoreboard and adds all players currently online to the scoreboard with a score of 0
This will also give you an NPC Spawn Egg

If you didn't get a Spawn Egg from the last command you run `/give @p spawn_egg 1 51`
You can also use `/summon npc ~ ~ ~`
This will summon an NPC at your current position.

Interact with the NPC and click on `Edit Dialog`

Enter text you want the NPC to say, then go back and to the `Advanced Settings`

Change the command to `Button Mode` and enter a dialogue or function command from the pack

E.g. `dialogue open @s @initiator petshop_buy` or `function farmer/beef`
It is recommended to use the `dialogue` commands as this will allow NPC shops to automatically update with new items. `function` commands should only be used for manually selecting items to be sold/purchased. See bellow for available dialogues.

Do this for all your shops and now you have a working economy in your world.
You can follow the function commands here: [raw/functions](raw/functions)

Alternatively you can run `/dialogue change @e[family=npc,r=5,c=1] {dialogue}` in chat while standing next to an NPC to set up a pre-configured dialogue and command buttons

### Available dialogues `dialogue open @s @initiator {dialogue}`: 
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

### Help Commands
Moneyz Economy 1.6.0+ comes with various help documentation to help all players setup and use Moneyz easily.
World Owners/Admins should update to 1.6.0+ to setup an NPC with the help commands in a general area for all players to get help with Moneyz. 

To setup a Help NPC run `/dialogue change @e[family=npc,r=5,c=1] help` in chat while standing next to an NPC to set up a pre-configured NPC, or set up an NPC with `dialogue open @s @initiator help`

These commands include tips for World Owners/Admins settings up their shops, and allows players to check their Moneyz balance or the available items and prices in any shop.

## Dialogue VS Function
It is recommended to use the `dialogue` commands as this will allow NPC shops to automatically update with new items. `function` commands should only be used for manually selecting items to be sold/purchased.

Dialogue commands allow NPCs to update with new items as they release. World Owners/Admins no longer need to enter each individual function command as they're already preconfigured with the dialogue command. 

NPCs have a 6 button limit but `dialogue` commands can bypass this by allowing the NPC to have 'multiple menus'. With `dialogue` commands you no longer need multiple NPCs for 1 shop. 1 NPC can do it all!

If you're updating from a previous version and want to use the new `dialogue` command with your existing shops you an easily run `/dialogue change @e[family=npc,r=5,c=1] {dialogue}` in chat while standing next to an NPC to upgrade it hassle free.

### Google Sheets Link:
Below is a link to a table that list all available items and prices

https://docs.google.com/spreadsheets/d/1TG4Ol5z_8U7mEJlSLx4I2LBmPVcJ0Aawu3_o_ac4xvU
