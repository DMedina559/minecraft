playsound note.bassattack @initiator[scores={Moneyz=..14}] ~ ~ ~

execute as @initiator[scores={Moneyz=..14}] run tell @s §cYou can't buy 20 Warped Planks!

execute as @initiator[scores={Moneyz=..14}] run tellraw @s {"rawtext": [{"text": "§cYou need 20 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=15..}] ~ ~ ~

execute as @initiator[scores={Moneyz=15..}] run tell @s §aYou can buy 20 Warped Planks!

execute as @initiator[scores={Moneyz=15..}] run give @s warped_plank 20

execute as @initiator[scores={Moneyz=15..}] run tell @s §aPurchased 20 Warped Planks!

execute as @initiator[scores={Moneyz=15..}] run scoreboard players remove @s Moneyz 15