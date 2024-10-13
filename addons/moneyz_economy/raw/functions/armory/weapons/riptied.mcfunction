playsound note.bassattack @initiator[scores={Moneyz=..999}] ~ ~ ~

execute as @initiator[scores={Moneyz=..999}] run tell @s §cYou can't buy a Riptied Trident!

execute as @initiator[scores={Moneyz=..999}] run tellraw @s {"rawtext": [{"text": "§cYou need 1000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=1000..}] ~ ~ ~

execute as @initiator[scores={Moneyz=1000..}] run tell @s §aYou can buy a Riptied Trident!

execute as @initiator[scores={Moneyz=1000..}] run structure load armory:riptied ~ ~ ~

execute as @initiator[scores={Moneyz=1000..}] run tell @s §aPurchased a Riptied Trident!

execute as @initiator[scores={Moneyz=1000..}] run scoreboard players remove @s Moneyz 1000