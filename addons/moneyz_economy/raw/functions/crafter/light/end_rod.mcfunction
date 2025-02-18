execute as @initiator[scores={Moneyz=..124}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..124}] run tell @s §cYou can't buy 15 End Rods!

execute as @initiator[scores={Moneyz=..124}] run tellraw @s {"rawtext": [{"text": "§cYou need 125 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=125..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=125..}] run tell @s §aYou can buy 15 End Rods!

execute as @initiator[scores={Moneyz=125..}] run give @s end_rod 15 

execute as @initiator[scores={Moneyz=125..}] run tell @s §aPurchased 15 End Rods!

execute as @initiator[scores={Moneyz=125..}] run scoreboard players remove @s Moneyz 125
