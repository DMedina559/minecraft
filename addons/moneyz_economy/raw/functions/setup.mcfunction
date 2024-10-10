tell @s §eSetting Up Moneyz Scoreboard

scoreboard objectives add Moneyz dummy Moneyz

tell @s §aAdded Moneyz Scoreboard Objective

tell @s §eSetting Moneyz Scoreboard display to Pause Menu

scoreboard objectives setdisplay list Moneyz

tell @s §aSet Moneyz Scoreboard display to Pause Menu

tell @s §eAdding all Online Players to Moneyz Scoreboard

scoreboard players add @a Moneyz 0

tell @s §aAdded all Online Players to Moneyz Scoreboard

tell @s §aMoneyz Scoreboard setup.

tell @s §eAdding Self as Moneyz Admin.

tag @s add moneyzAdmin

tell @s §aAdded Self as Moneyz Admin.

give @s spawn_egg 1 51

tell @s §rYou can now build your §eNPC Shops.

tellraw @p {"rawtext": [{"text": "§6It's recommended to set up a NPC with §e/dialogue open @s @initiator help§6, and read through the menus.\n"}]}