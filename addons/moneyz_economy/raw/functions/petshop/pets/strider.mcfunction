playsound note.bassattack @initiator[scores={Moneyz=..79}] ~ ~ ~

execute as @initiator[scores={Moneyz=..79}] run tell @s §cYou can't buy a Strider!

execute as @initiator[scores={Moneyz=..79}] run tellraw @s {"rawtext": [{"text": "§cYou need 80 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound note.bassattack @initiator[scores={Moneyz=80..}] ~ ~ ~

execute as @initiator[scores={Moneyz=80..}] run tell @s §aYou can buy a Strider!

execute as @initiator[scores={Moneyz=80..}] run give @s strider_spawn_egg

execute as @initiator[scores={Moneyz=80..}] run tell @s §aPurchased a Strider!

execute as @initiator[scores={Moneyz=80..}] run scoreboard players remove @s Moneyz 80