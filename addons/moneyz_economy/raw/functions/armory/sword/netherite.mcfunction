playsound note.bassattack @initiator[scores={Moneyz=..5999}] ~ ~ ~

execute as @initiator[scores={Moneyz=..5999}] run tell @s §cYou can't buy Netherite Sword!

execute as @initiator[scores={Moneyz=..5999}] run tellraw @s {"rawtext": [{"text": "§cYou need 6000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=6000..}] ~ ~ ~

execute as @initiator[scores={Moneyz=6000..}] run tell @s §aYou can buy Netherite Sword!

execute as @initiator[scores={Moneyz=6000..}] run structure load armory:netherite_sword ~ ~ ~

execute as @initiator[scores={Moneyz=6000..}] run tell @s §aPurchased Netherite Sword!

execute as @initiator[scores={Moneyz=6000..}] run scoreboard players remove @s Moneyz 6000