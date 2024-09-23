execute as @initiator[scores={Moneyz=..4999}] run tell @s §cYou can't buy a Gold AWT!

execute as @initiator[scores={Moneyz=..4999}] run tellraw @s {"rawtext": [{"text": "§cYou need 5000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=5000..}] run tell @s §aYou can buy a Gold AWT!

execute as @initiator[scores={Moneyz=5000..}] run structure load workshop:awt_gold ^ ^1 ^-1

execute as @initiator[scores={Moneyz=5000..}] run tell @s §aPurchased a Gold AWT!

execute as @initiator[scores={Moneyz=5000..}] run scoreboard players remove @s Moneyz 5000