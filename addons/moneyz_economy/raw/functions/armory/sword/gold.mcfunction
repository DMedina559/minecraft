playsound note.bassattack @initiator[scores={Moneyz=..2999}] ~ ~ ~

execute as @initiator[scores={Moneyz=..2999}] run tell @s §cYou can't buy Gold Sword!

execute as @initiator[scores={Moneyz=..2999}] run tellraw @s {"rawtext": [{"text": "§cYou need 3000 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=3000..}] ~ ~ ~

execute as @initiator[scores={Moneyz=3000..}] run tell @s §aYou can buy Gold Sword!

execute as @initiator[scores={Moneyz=3000..}] run structure load armory:gold_sword ~ ~ ~

execute as @initiator[scores={Moneyz=3000..}] run tell @s §aPurchased Gold Sword!

execute as @initiator[scores={Moneyz=3000..}] run scoreboard players remove @s Moneyz 3000