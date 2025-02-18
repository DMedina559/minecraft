execute as @initiator[scores={Moneyz=..54}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..54}] run tell @s §cYou can't buy 15 Sea Lanterns!

execute as @initiator[scores={Moneyz=..54}] run tellraw @s {"rawtext": [{"text": "§cYou need 55 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=55..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=55..}] run tell @s §aYou can buy 15 Sea Lanterns!

execute as @initiator[scores={Moneyz=55..}] run give @s sea_lantern 15 

execute as @initiator[scores={Moneyz=55..}] run tell @s §aPurchased 15 Sea Lanterns!

execute as @initiator[scores={Moneyz=55..}] run scoreboard players remove @s Moneyz 55
