playsound note.bassattack @initiator[scores={Moneyz=..2999}] ~ ~ ~

execute as @initiator[scores={Moneyz=..2999}] run tell @s §cYou can't buy Diamond Axe!

execute as @initiator[scores={Moneyz=..2999}] run tellraw @s {"rawtext": [{"text": "§cYou need 3000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=3000..}] ~ ~ ~

execute as @initiator[scores={Moneyz=3000..}] run tell @s §aYou can buy Diamond Axe!

execute as @initiator[scores={Moneyz=3000..}] run structure load armory:diamond_axe ~ ~ ~

execute as @initiator[scores={Moneyz=3000..}] run tell @s §aPurchased Diamond Axe!

execute as @initiator[scores={Moneyz=3000..}] run scoreboard players remove @s Moneyz 3000