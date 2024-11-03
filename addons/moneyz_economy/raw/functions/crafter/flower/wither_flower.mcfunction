execute as @initiator[scores={Moneyz=..39}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..39}] run tell @s §cYou can't buy a Wither Flower!

execute as @initiator[scores={Moneyz=..39}] run tellraw @s {"rawtext": [{"text": "§cYou need 40 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=40..}] run tell @s §aYou can buy a Wither Flower!

execute as @initiator[scores={Moneyz=40..}] run give @s wither_flower 1

execute as @initiator[scores={Moneyz=40..}] run tell @s §aPurchased a Wither Flower!

execute as @initiator[scores={Moneyz=40..}] run scoreboard players remove @s Moneyz 40