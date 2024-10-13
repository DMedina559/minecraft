playsound note.bassattack @initiator[scores={Moneyz=..299}] ~ ~ ~

execute as @initiator[scores={Moneyz=..299}] run tell @s §cYou can't buy Gold Hoe!

execute as @initiator[scores={Moneyz=..299}] run tellraw @s {"rawtext": [{"text": "§cYou need 300 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=300..}] ~ ~ ~

execute as @initiator[scores={Moneyz=300..}] run tell @s §aYou can buy Gold Hoe!

execute as @initiator[scores={Moneyz=300..}] run structure load armory:gold_hoe ~ ~ ~

execute as @initiator[scores={Moneyz=300..}] run tell @s §aPurchased Gold Hoe!

execute as @initiator[scores={Moneyz=300..}] run scoreboard players remove @s Moneyz 300