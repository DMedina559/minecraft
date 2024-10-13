playsound note.bassattack @initiator[scores={Moneyz=..1499}] ~ ~ ~

execute as @initiator[scores={Moneyz=..1499}] run tell @s §cYou can't buy Netherite Shovel!

execute as @initiator[scores={Moneyz=..1499}] run tellraw @s {"rawtext": [{"text": "§cYou need 1500 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=1500..}] ~ ~ ~

execute as @initiator[scores={Moneyz=1500..}] run tell @s §aYou can buy Netherite Shovel!

execute as @initiator[scores={Moneyz=1500..}] run structure load armory:netherite_shovel ~ ~ ~

execute as @initiator[scores={Moneyz=1500..}] run tell @s §aPurchased Netherite Shovel!

execute as @initiator[scores={Moneyz=1500..}] run scoreboard players remove @s Moneyz 1500