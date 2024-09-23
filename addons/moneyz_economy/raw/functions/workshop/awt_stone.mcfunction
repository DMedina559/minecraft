execute as @initiator[scores={Moneyz=..2999}] run tell @s §cYou can't buy a Stone AWT!

execute as @initiator[scores={Moneyz=..2999}] run tellraw @s {"rawtext": [{"text": "§cYou need 3000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=3000..}] run tell @s §aYou can buy a Stone AWT!

execute as @initiator[scores={Moneyz=3000..}] run structure load workshop:awt_stone ^ ^1 ^-1

execute as @initiator[scores={Moneyz=3000..}] run tell @s §aPurchased a Stone AWT!

execute as @initiator[scores={Moneyz=3000..}] run scoreboard players remove @s Moneyz 3000