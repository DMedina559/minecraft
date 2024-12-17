playsound note.bassattack @initiator[scores={Moneyz=..49}] ~ ~ ~

execute as @initiator[scores={Moneyz=..49}] run tell @s §cYou can't make a Lucky Purchase!\n Try Again Tomorrow

execute as @initiator[scores={Moneyz=..49}] run tellraw @s {"rawtext": [{"text": "§cYou need 50 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=50..}] ~ ~ ~

execute as @initiator[scores={Moneyz=50..}] run tell @s §aYou can make a Lucky Purchase!

execute as @initiator[scores={Moneyz=50..}] run loot spawn ~ ~ ~ loot petshop

execute as @initiator[scores={Moneyz=50..}] run tell @s §aDo You Feel Lucky?

execute as @initiator[scores={Moneyz=50..}] run scoreboard players remove @s Moneyz 50