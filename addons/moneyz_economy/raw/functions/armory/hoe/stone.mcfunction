playsound note.bassattack @initiator[scores={Moneyz=..199}] ~ ~ ~

execute as @initiator[scores={Moneyz=..199}] run tell @s §cYou can't buy Stone Hoe!

execute as @initiator[scores={Moneyz=..199}] run tellraw @s {"rawtext": [{"text": "§cYou need 200 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=200..}] ~ ~ ~

execute as @initiator[scores={Moneyz=200..}] run tell @s §aYou can buy Stone Hoe!

execute as @initiator[scores={Moneyz=200..}] run structure load armory:stone_hoe ~ ~ ~

execute as @initiator[scores={Moneyz=200..}] run tell @s §aPurchased Stone Hoe!

execute as @initiator[scores={Moneyz=200..}] run scoreboard players remove @s Moneyz 200