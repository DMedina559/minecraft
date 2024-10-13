playsound note.bassattack @initiator[scores={Moneyz=..249}] ~ ~ ~

execute as @initiator[scores={Moneyz=..249}] run tell @s §cYou can't buy Wood Shovel!

execute as @initiator[scores={Moneyz=..249}] run tellraw @s {"rawtext": [{"text": "§cYou need 250 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=250..}] ~ ~ ~

execute as @initiator[scores={Moneyz=250..}] run tell @s §aYou can buy Wood Shovel!

execute as @initiator[scores={Moneyz=250..}] run structure load armory:wood_shovel ~ ~ ~

execute as @initiator[scores={Moneyz=250..}] run tell @s §aPurchased Wood Shovel!

execute as @initiator[scores={Moneyz=250..}] run scoreboard players remove @s Moneyz 250