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

tell @s §aATM and Send enabled for Moneyz Menu.
tell @s §cShops, Lucky Purchases, and Daily Rewards access in the Moneyz Menu is disabled. Admins can enable through the Admin Menu.

give @s zvortex:moneyz_menu

tellraw @s {"rawtext": [{"text": "§6It's recommended to use the Moneyz Menu to read through the Help documentation.\n"}]}