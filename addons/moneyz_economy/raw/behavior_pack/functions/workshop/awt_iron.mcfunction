execute as @initiator[scores={Moneyz=..9999}] run tell @s §cYou can't buy a Iron AWT!

execute as @initiator[scores={Moneyz=..9999}] run tellraw @s {"rawtext": [{"text": "§cYou need 10000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=10000..}] run tell @s §aYou can buy a Iron AWT!

execute as @initiator[scores={Moneyz=10000..}] run structure load workshop:awt_iron ^ ^1 ^-1

execute as @initiator[scores={Moneyz=10000..}] run tell @s §aPurchased a Iron AWT!

execute as @initiator[scores={Moneyz=10000..}] run scoreboard players remove @s Moneyz 10000