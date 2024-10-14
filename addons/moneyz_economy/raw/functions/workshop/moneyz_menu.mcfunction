playsound note.bassattack @initiator[scores={Moneyz=..1264}] ~ ~ ~

execute as @initiator[scores={Moneyz=..1264}] run tell @s §cYou can't buy a Moneyz Menu!

execute as @initiator[scores={Moneyz=..1265}] run tellraw @s {"rawtext": [{"text": "§cYou need 1,265 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=1265..}] ~ ~ ~

execute as @initiator[scores={Moneyz=1265..}] run tell @s §aYou can buy a Moneyz Menu!

execute as @initiator[scores={Moneyz=1265..}] run give @s zvortex:moneyz_menu

execute as @initiator[scores={Moneyz=1265..}] run tell @s §aPurchased a Moneyz Menu!

execute as @initiator[scores={Moneyz=1265..}] run scoreboard players remove @s Moneyz 1265