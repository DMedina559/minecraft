playsound note.bassattack @initiator[scores={Moneyz=..599}] ~ ~ ~

execute as @initiator[scores={Moneyz=..599}] run tell @s §cYou can't buy Netherite Hoe!

execute as @initiator[scores={Moneyz=..599}] run tellraw @s {"rawtext": [{"text": "§cYou need 600 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=600..}] ~ ~ ~

execute as @initiator[scores={Moneyz=600..}] run tell @s §aYou can buy Netherite Hoe!

execute as @initiator[scores={Moneyz=600..}] run structure load armory:netherite_hoe ~ ~ ~

execute as @initiator[scores={Moneyz=600..}] run tell @s §aPurchased Netherite Hoe!

execute as @initiator[scores={Moneyz=600..}] run scoreboard players remove @s Moneyz 600