playsound note.bassattack @initiator[scores={Moneyz=..1249}] ~ ~ ~

execute as @initiator[scores={Moneyz=..1249}] run tell @s §cYou can't buy Diamond Shovel!

execute as @initiator[scores={Moneyz=..1249}] run tellraw @s {"rawtext": [{"text": "§cYou need 1250 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=1250..}] ~ ~ ~

execute as @initiator[scores={Moneyz=1250..}] run tell @s §aYou can buy Diamond Shovel!

execute as @initiator[scores={Moneyz=1250..}] run structure load armory:diamond_shovel ~ ~ ~

execute as @initiator[scores={Moneyz=1250..}] run tell @s §aPurchased Diamond Shovel!

execute as @initiator[scores={Moneyz=1250..}] run scoreboard players remove @s Moneyz 1250