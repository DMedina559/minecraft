playsound note.bassattack @initiator[scores={Moneyz=..99}] ~ ~ ~

execute as @initiator[scores={Moneyz=..99}] run tell @s §cYou can't buy Wood Hoe!

execute as @initiator[scores={Moneyz=..99}] run tellraw @s {"rawtext": [{"text": "§cYou need 100 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=100..}] ~ ~ ~

execute as @initiator[scores={Moneyz=100..}] run tell @s §aYou can buy Wood Hoe!

execute as @initiator[scores={Moneyz=100..}] run structure load armory:wood_hoe ~ ~ ~

execute as @initiator[scores={Moneyz=100..}] run tell @s §aPurchased Wood Hoe!

execute as @initiator[scores={Moneyz=100..}] run scoreboard players remove @s Moneyz 100