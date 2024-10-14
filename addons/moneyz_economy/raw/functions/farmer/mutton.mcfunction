playsound note.bassattack @initiator[scores={Moneyz=..24}] ~ ~ ~

execute as @initiator[scores={Moneyz=..24}] run tell @s §cYou can't buy 5 Raw Muttons!

execute as @initiator[scores={Moneyz=..24}] run tellraw @s {"rawtext": [{"text": "§cYou need 25 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=25..}] ~ ~ ~

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou can buy 5 Raw Muttons!

execute as @initiator[scores={Moneyz=25..}] run give @s mutton 5

execute as @initiator[scores={Moneyz=25..}] run tell @s §aPurchased 5 Raw Muttons!

execute as @initiator[scores={Moneyz=25..}] run scoreboard players remove @s Moneyz 25