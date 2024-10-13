execute as @initiator[scores={Moneyz=..24}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..24}] run tellraw @s {"rawtext": [{"text": "§cYou need 25 Moneyz for this exchange\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=25..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou can make this Exchange!

execute as @initiator[scores={Moneyz=25..}] run give @s gold_ingot 1

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou Exchanged 1 Gold Ingot for 25 Moneyz!

execute as @initiator[scores={Moneyz=25..}] run scoreboard players remove @s Moneyz 25
