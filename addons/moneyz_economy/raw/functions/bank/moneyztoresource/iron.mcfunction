execute as @initiator[scores={Moneyz=..49}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..49}] run tellraw @s {"rawtext": [{"text": "§cYou need 50 Moneyz for this exchange\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=50..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=50..}] run tell @s §aYou can make this Exchange!

execute as @initiator[scores={Moneyz=50..}] run give @s iron_ingot 1

execute as @initiator[scores={Moneyz=50..}] run tell @s §aYou Exchanged 1 Iron Ingot for 50 Moneyz!

execute as @initiator[scores={Moneyz=50..}] run scoreboard players remove @s Moneyz 50
