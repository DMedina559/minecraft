playsound note.bassattack @initiator[scores={Moneyz=..9}] ~ ~ ~

execute as @initiator[scores={Moneyz=..9}] run tell @s §cYou can't buy 20 Cherry Planks!

execute as @initiator[scores={Moneyz=..9}] run tellraw @s {"rawtext": [{"text": "§cYou need 10 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=10..}] ~ ~ ~

execute as @initiator[scores={Moneyz=10..}] run tell @s §aYou can buy 20 Cherry Planks!

execute as @initiator[scores={Moneyz=10..}] run give @s cherry_planks 20

execute as @initiator[scores={Moneyz=10..}] run tell @s §aPurchased 20 Cherry Planks!

execute as @initiator[scores={Moneyz=10..}] run scoreboard players remove @s Moneyz 10