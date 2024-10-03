execute as @initiator[scores={Moneyz=..19999}] run tell @s §cYou can't buy a Diamond AWT!

execute as @initiator[scores={Moneyz=..19999}] run tellraw @s {"rawtext": [{"text": "§cYou need 20000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=20000..}] run tell @s §aYou can buy a Diamond AWT!

execute as @initiator[scores={Moneyz=20000..}] run structure load workshop:awt_diamond ^ ^1 ^-1

execute as @initiator[scores={Moneyz=20000..}] run tell @s §aPurchased a Diamond AWT!

execute as @initiator[scores={Moneyz=20000..}] run scoreboard players remove @s Moneyz 20000