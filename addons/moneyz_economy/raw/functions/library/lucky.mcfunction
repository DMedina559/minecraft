playsound note.bassattack @s[scores={Moneyz=..19}] ~ ~ ~

execute as @s[scores={Moneyz=..19}] run tell @s §cYou can't make a Lucky Purchase!\n Try Again Tomorrow

execute as @s[scores={Moneyz=..19}] run tellraw @s {"rawtext": [{"text": "§cYou need 20 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @s[scores={Moneyz=20..}] ~ ~ ~

execute as @s[scores={Moneyz=20..}] run tell @s §aYou can make a Lucky Purchase!

execute as @s[scores={Moneyz=20..}] run loot spawn ~ ~ ~ loot library

execute as @s[scores={Moneyz=20..}] run tell @s §aDo You Feel Lucky?

execute as @s[scores={Moneyz=20..}] run scoreboard players remove @s Moneyz 20