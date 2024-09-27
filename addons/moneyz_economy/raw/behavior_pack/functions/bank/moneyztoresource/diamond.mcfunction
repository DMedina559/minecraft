execute as @initiator[scores={Moneyz=..74}] run tellraw @s {"rawtext": [{"text": "§cYou need 75 Moneyz for this exchange\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=75..}] run tell @s §aYou can make this Exchange!

execute as @initiator[scores={Moneyz=75..}] run give @s diamond 1

execute as @initiator[scores={Moneyz=75..}] run tell @s §aYou Exchanged 1 Diamond for 75 Moneyz!

execute as @initiator[scores={Moneyz=75..}] run scoreboard players remove @s Moneyz 75
