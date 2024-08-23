execute as @initiator[scores={Moneyz=..999}] run tellraw @s {"rawtext": [{"text": "§cYou need 1000 Moneyz for this exchange\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=1000..}] run tell @s §aYou can make this Exchange!

execute as @initiator[scores={Moneyz=1000..}] run give @s netherite_ingot 1

execute as @initiator[scores={Moneyz=1000..}] run tell @s §aYou Exchanged 1 Netherite Ingot for 1,000 Moneyz!

execute as @initiator[scores={Moneyz=1000..}] run scoreboard players remove @s Moneyz 1000
