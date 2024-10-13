execute as @initiator[scores={Moneyz=..9}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..9}] run tellraw @s {"rawtext": [{"text": "§cYou need 10 Moneyz for this exchange\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=10..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=10..}] run tell @s §aYou can make this Exchange!

execute as @initiator[scores={Moneyz=10..}] run give @s copper_ingot 1

execute as @initiator[scores={Moneyz=10..}] run tell @s §aYou Exchanged 1 Copper Ingot for 10 Moneyz!

execute as @initiator[scores={Moneyz=10..}] run scoreboard players remove @s Moneyz 10
