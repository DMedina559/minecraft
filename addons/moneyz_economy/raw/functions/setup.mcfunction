tell @s §eSetting Up Moneyz Scoreboard

scoreboard objectives add Moneyz dummy Moneyz

tell @s §aAdded Moneyz Scoreboard Objective

tell @s §eAdding all Online Players to Moneyz Scoreboard

scoreboard players add @a Moneyz 0

tell @s §aAdded all Online Players to Moneyz Scoreboard

tell @s §aMoneyz Scoreboard setup.

tell @s §eAdding Self as Moneyz Admin.

tag @s add moneyzAdmin

tell @s §aAdded Self as Moneyz Admin.

give @s spawn_egg 1 51

tell @s §rYou can now build your §eNPC Shops.

scoreboard objectives add moneyzAutoTag dummy
scoreboard players add moneyzShop moneyzAutoTag 0
scoreboard players add moneyzATM moneyzAutoTag 0
scoreboard players add moneyzSend moneyzAutoTag 0

give @s zvortex:moneyz_menu

tellraw @s {"rawtext": [{"text": "§6It's recommended to use the Moneyz Menu to read through the help documentation.\n"}]}