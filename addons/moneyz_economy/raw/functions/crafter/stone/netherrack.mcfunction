execute as @initiator[scores={Moneyz=..4}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..4}] run tell @s §cYou can't buy 15 Netherrack!

execute as @initiator[scores={Moneyz=..4}] run tellraw @s {"rawtext": [{"text": "§cYou need 5 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=5..}] run tell @s §aYou can buy 15 Netherrack!

execute as @initiator[scores={Moneyz=5..}] run give @s netherrack 16

execute as @initiator[scores={Moneyz=5..}] run tell @s §aPurchased 15 Netherrack!

execute as @initiator[scores={Moneyz=5..}] run scoreboard players remove @s Moneyz 5