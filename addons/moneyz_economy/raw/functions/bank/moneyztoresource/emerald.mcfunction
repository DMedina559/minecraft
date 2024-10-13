execute as @initiator[scores={Moneyz=..99}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..99}] run tellraw @s {"rawtext": [{"text": "§cYou need 100 Moneyz for this exchange\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=100..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=100..}] run tell @s §aYou can make this Exchange!

execute as @initiator[scores={Moneyz=100..}] run give @s emerald 1

execute as @initiator[scores={Moneyz=100..}] run tell @s §aYou Exchanged 1 Emerald for 100 Moneyz!

execute as @initiator[scores={Moneyz=100..}] run scoreboard players remove @s Moneyz 100
