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

tell @s §eEnabling ATM and Send for Moneyz Menu.
scoreboard objectives add moneyzAutoTag dummy
scoreboard players add moneyzShop moneyzAutoTag 0
scoreboard players add moneyzATM moneyzAutoTag 1
scoreboard players add moneyzSend moneyzAutoTag 1
tell @s §aATM and Send enabled for Moneyz Menu.
tell @s §cShops disabled for Moneyz Menu. Admins can enable through Moneyz Menu.

tag @a add moneyzATM
tag @a add moneyzSend

tell @s §rATM and Send enabled for Moneyz Menu.

give @s zvortex:moneyz_menu

tellraw @s {"rawtext": [{"text": "§6It's recommended to use the Moneyz Menu to read through the help documentation.\n"}]}