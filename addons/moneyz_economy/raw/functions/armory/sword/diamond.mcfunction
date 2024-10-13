playsound note.bassattack @initiator[scores={Moneyz=..4999}] ~ ~ ~

execute as @initiator[scores={Moneyz=..4999}] run tell @s §cYou can't buy Diamond Sword!

execute as @initiator[scores={Moneyz=..4999}] run tellraw @s {"rawtext": [{"text": "§cYou need 5000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=5000..}] ~ ~ ~

execute as @initiator[scores={Moneyz=5000..}] run tell @s §aYou can buy Diamond Sword!

execute as @initiator[scores={Moneyz=5000..}] run structure load armory:diamond_sword ~ ~ ~

execute as @initiator[scores={Moneyz=5000..}] run tell @s §aPurchased Diamond Sword!

execute as @initiator[scores={Moneyz=5000..}] run scoreboard players remove @s Moneyz 5000