playsound note.bassattack @initiator[scores={Moneyz=..19}] ~ ~ ~

execute as @initiator[scores={Moneyz=..19}] run tell @s §cYou can't buy 20 Crimson Planks!

execute as @initiator[scores={Moneyz=..19}] run tellraw @s {"rawtext": [{"text": "§cYou need 20 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=20..}] ~ ~ ~

execute as @initiator[scores={Moneyz=20..}] run tell @s §aYou can buy 20 Crimson Planks!

execute as @initiator[scores={Moneyz=20..}] run give @s crimson_planks 20

execute as @initiator[scores={Moneyz=20..}] run tell @s §aPurchased 20 Crimson Planks!

execute as @initiator[scores={Moneyz=20..}] run scoreboard players remove @s Moneyz 20