execute as @initiator[scores={Moneyz=..29}] run tellraw @s {"rawtext": [{"text": "§cYou need 30 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=30..}] run tell @s §aYou can buy 5 Raw Beefs!

execute as @initiator[scores={Moneyz=30..}] run give @s beef 5

execute as @initiator[scores={Moneyz=30..}] run tell @s §aPurchased 5 Raw Beefs!

execute as @initiator[scores={Moneyz=30..}] run scoreboard players remove @s Moneyz 30