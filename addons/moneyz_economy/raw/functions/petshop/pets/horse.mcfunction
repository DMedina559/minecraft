playsound note.bassattack @initiator[scores={Moneyz=..59}] ~ ~ ~

execute as @initiator[scores={Moneyz=..59}] run tell @s §cYou can't buy a Horse!

execute as @initiator[scores={Moneyz=..59}] run tellraw @s {"rawtext": [{"text": "§cYou need 60 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=60..}] ~ ~ ~

execute as @initiator[scores={Moneyz=60..}] run tell @s §aYou can buy a Horse!

execute as @initiator[scores={Moneyz=60..}] run give @s horse_spawn_egg

execute as @initiator[scores={Moneyz=60..}] run tell @s §aPurchased a Horse!

execute as @initiator[scores={Moneyz=60..}] run scoreboard players remove @s Moneyz 60