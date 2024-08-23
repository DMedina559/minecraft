execute as @initiator[scores={Moneyz=..24}] run tellraw @s {"rawtext": [{"text": "§cYou need 25 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou can buy a Lead!

execute as @initiator[scores={Moneyz=25..}] run give @s lead

execute as @initiator[scores={Moneyz=25..}] run tell @s §aPurchased a Lead!

execute as @initiator[scores={Moneyz=25..}] run scoreboard players remove @s Moneyz 25