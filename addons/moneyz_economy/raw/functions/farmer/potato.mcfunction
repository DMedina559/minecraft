execute as @initiator[scores={Moneyz=..14}] run tellraw @s {"rawtext": [{"text": "§cYou need 15 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=15..}] run tell @s §aYou can buy 10 Potatos!

execute as @initiator[scores={Moneyz=15..}] run give @s potato 10

execute as @initiator[scores={Moneyz=15..}] run tell @s §aPurchased 10 Potatos!

execute as @initiator[scores={Moneyz=15..}] run scoreboard players remove @s Moneyz 15