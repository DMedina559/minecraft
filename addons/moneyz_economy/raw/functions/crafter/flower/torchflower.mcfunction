execute as @initiator[scores={Moneyz=..39}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..39}] run tell @s §cYou can't buy a Torchflower!

execute as @initiator[scores={Moneyz=..39}] run tellraw @s {"rawtext": [{"text": "§cYou need 40 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=40..}] run tell @s §aYou can buy a Torchflower!

execute as @initiator[scores={Moneyz=40..}] run give @s torchflower 1

execute as @initiator[scores={Moneyz=40..}] run tell @s §aPurchased a Torchflower!

execute as @initiator[scores={Moneyz=40..}] run scoreboard players remove @s Moneyz 40