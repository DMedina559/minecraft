# Downloading Addons
To download any content from this respitory click on the desired file you want and click on "Download Raw File"

If on Mobile, after clicking on the desired files tap the 3 dot menu in the top corner and press Download.

# Moneyz Economy
Moneyz Economy is a function pack for Minecraft Bedrock, that allows you to buy/sell items, apply for jobs and much more. A modified version is also used in the world MountainSide Villages 1.1.0+

Moneyz Economy allows you to easily add a bustling economy to any of your worlds! Just simply spawn an npc and enter the function command (e.g. `function petshop/pets/dog`), now you have a shops person to sell you items, houses, kits, or even give you a job.

### Why use NPCs and not Chat Commands or Command Blocks?
I decided to use NPC's for this pack as all commands are ran as `@initiator` instead of `@p` or `@s`. This means all commands are ran as the person interacting with the NPC and not any close player that happens to meet the requirements. (You can easily change this in any text editor.)

### To Get Started 

Moneyz 1.5.0+ makes it easy to start using Moneyz in your world.

Just start your world with cheats and the behavior pack enabled and run these chat commands.

First run

`/function setup`

This will set up the Moneyz scoreboard and adds all players currently online to the scoreboard with a score of 0
This will also give you an NPC Spawn Egg

If you didn't get a Spawn Egg from the last command you run `/give @p spawn_egg 1 51`
You can also use `/summon npc ~ ~ ~`
This will summon an NPC at your current position.

Interact with the NPC and click on `Edit Dialog`

Enter a dialogue for the NPC then go back and to the `Advanced Settings`

Change the command to `Button Mode` and enter a function command from the pack

E.g. `function farmer/beef`

Do this for all your shops and now you have a working economy in your world.
You can follow the function commands here: [raw/functions](raw/functions)

### Help Commands
Moneyz Economy 1.4.0+ comes with various `/function help/` commands to help players with OP permisions setup and use Moneyz easily.
Since only OP permission players can run `/function commands`, World Owners/Admins should update to 1.5.0+ to setup NPCs with the help commands in a general area for all players to get help with Moneyz.

These commands include tips for World Owners/Admins settings up their shops, and allows players to check their Moneyz balance or the available items and prices in any shop.

Players can run `/function help/my_balance` to check their Moneyz balance

Players can run `/function help/{SHOP}` to get a list of all Items and Prices

Players can run `/function help/jobs/{JOB}` to get details about all jobs

Players can run `/function help/exchange_rate` to view the exchange rate between Moneyz and Resource

Players can run `/function help/setup` for instructions and recommendations

Players can run `/function help` to list all `help/` commands

### Google Sheets Link:
Below is a link to a table that list all available items and prices

https://docs.google.com/spreadsheets/d/1TG4Ol5z_8U7mEJlSLx4I2LBmPVcJ0Aawu3_o_ac4xvU
