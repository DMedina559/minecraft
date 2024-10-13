playsound note.bassattack @initiator[scores={Moneyz=..749}] ~ ~ ~

execute as @initiator[scores={Moneyz=..749}] run tell @s §cYou can't buy Gold Shovel!

execute as @initiator[scores={Moneyz=..749}] run tellraw @s {"rawtext": [{"text": "§cYou need 750 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=750..}] ~ ~ ~

execute as @initiator[scores={Moneyz=750..}] run tell @s §aYou can buy Gold Shovel!

execute as @initiator[scores={Moneyz=750..}] run structure load armory:gold_shovel ~ ~ ~

execute as @initiator[scores={Moneyz=750..}] run tell @s §aPurchased Gold Shovel!

execute as @initiator[scores={Moneyz=750..}] run scoreboard players remove @s Moneyz 750