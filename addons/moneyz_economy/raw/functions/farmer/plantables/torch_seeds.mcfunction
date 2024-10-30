playsound note.bassattack @initiator[scores={Moneyz=..34}] ~ ~ ~

execute as @initiator[scores={Moneyz=..34}] run tell @s §cYou can't buy 1 Torchflower Seeds!

execute as @initiator[scores={Moneyz=..34}] run tellraw @s {"rawtext": [{"text": "§cYou need 35 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=35..}] ~ ~ ~

execute as @initiator[scores={Moneyz=35..}] run tell @s §aYou can buy 1 Torchflower Seeds!

execute as @initiator[scores={Moneyz=35..}] run give @s torchflower_seeds 1

execute as @initiator[scores={Moneyz=35..}] run tell @s §aPurchased 1 Torchflower Seeds!

execute as @initiator[scores={Moneyz=35..}] run scoreboard players remove @s Moneyz 35