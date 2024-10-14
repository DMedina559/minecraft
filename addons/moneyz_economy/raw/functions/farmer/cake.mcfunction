playsound note.bassattack @initiator[scores={Moneyz=..4}] ~ ~ ~

execute as @initiator[scores={Moneyz=..4}] run tell @s §cYou can't buy a Melons!

execute as @initiator[scores={Moneyz=..4}] run tellraw @s {"rawtext": [{"text": "§cYou need 15 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=15..}] ~ ~ ~

execute as @initiator[scores={Moneyz=15..}] run tell @s §aYou can buy a Melons!

execute as @initiator[scores={Moneyz=15..}] run give @s cake 1

execute as @initiator[scores={Moneyz=15..}] run tell @s §aPurchased a Melons!

execute as @initiator[scores={Moneyz=15..}] run scoreboard players remove @s Moneyz 15