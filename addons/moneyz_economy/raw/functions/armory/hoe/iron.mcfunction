playsound note.bassattack @initiator[scores={Moneyz=..449}] ~ ~ ~

execute as @initiator[scores={Moneyz=..449}] run tell @s §cYou can't buy Iron Hoe!

execute as @initiator[scores={Moneyz=..449}] run tellraw @s {"rawtext": [{"text": "§cYou need 450 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=450..}] ~ ~ ~

execute as @initiator[scores={Moneyz=450..}] run tell @s §aYou can buy Iron Hoe!

execute as @initiator[scores={Moneyz=450..}] run structure load armory:iron_hoe ~ ~ ~

execute as @initiator[scores={Moneyz=450..}] run tell @s §aPurchased Iron Hoe!

execute as @initiator[scores={Moneyz=450..}] run scoreboard players remove @s Moneyz 450