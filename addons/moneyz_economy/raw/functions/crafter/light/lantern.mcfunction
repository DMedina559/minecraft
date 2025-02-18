execute as @initiator[scores={Moneyz=..54}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..54}] run tell @s §cYou can't buy 10 Lanterns!

execute as @initiator[scores={Moneyz=..54}] run tellraw @s {"rawtext": [{"text": "§cYou need 55 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=55..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=55..}] run tell @s §aYou can buy 10 Lanterns!

execute as @initiator[scores={Moneyz=55..}] run give @s lantern 10 

execute as @initiator[scores={Moneyz=55..}] run tell @s §aPurchased 10 Lanterns!

execute as @initiator[scores={Moneyz=55..}] run scoreboard players remove @s Moneyz 55
