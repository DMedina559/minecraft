# Downloading Addons
To download any content from this respitory click on the desired file you want and click on "Download Raw File"

If on Mobile, after clicking on the desired files tap the 3 dot menu in the top corner and press Download.

# Moneyz Economy
Moneyz Economy is a function pack for Minecraft Bedrock, that allows you to buy items, apply for jobs and much more. A modified version is also used in the world MountainSide Villages 1.1.0+

Moneyz Economy allows you to easily add a bustling economy to any of your worlds! Just simply spawn an npc and enter the function command (e.g. `function petshop/pets/dog`) and now you have a shops person to sell you items, houses, or even give you a job.

### Why use NPCs and not Chat Commands or Command Blocks?
I decided to use NPC's for this pack as all commands are ran as `@initiator` instead of `@p` or `@s`. This means all commands are ran as the person interacting with the NPC and not any close player that happens to meet the requirements. (You can easily change this in any text editor.)

### To Get Started 

Start your world with cheats and the behavior pack enabled and run 

`/function setup` <sup> (1.2.0+ only) </sup>

This will set up the Moneyz scoreboard and adds all players currently online to the scoreboard with a score of 0

Next run `/give @p spawn_egg 1 51`

This will give you an NPC spawn egg to set up your shops.

Enter a dialogue for the NPC and in the advanced setting change the command to a button type and enter a function command from the pack

E.g. `function farmer/beef`

Do this for all your shops and now you have a working economy in your world.
