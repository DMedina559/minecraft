playsound note.bassattack @initiator[scores={Moneyz=..4}] ~ ~ ~

execute as @initiator[scores={Moneyz=..4}] run tell @s §cYou can't buy 20 Dark Oak Planks!

execute as @initiator[scores={Moneyz=..4}] run tellraw @s {"rawtext": [{"text": "§cYou need 5 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=5..}] ~ ~ ~

execute as @initiator[scores={Moneyz=5..}] run tell @s §aYou can buy 20 Dark Oak Planks!

execute as @initiator[scores={Moneyz=5..}] run give @s dark_oak_planks 20

execute as @initiator[scores={Moneyz=5..}] run tell @s §aPurchased 20 Dark Oak Planks!

execute as @initiator[scores={Moneyz=5..}] run scoreboard players remove @s Moneyz 5