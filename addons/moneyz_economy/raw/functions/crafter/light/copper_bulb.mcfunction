execute as @initiator[scores={Moneyz=..64}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..64}] run tell @s §cYou can't buy 10 Copper Bulbs!

execute as @initiator[scores={Moneyz=..64}] run tellraw @s {"rawtext": [{"text": "§cYou need 65 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=65..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=65..}] run tell @s §aYou can buy 10 Copper Bulbs!

execute as @initiator[scores={Moneyz=65..}] run give @s copper_bulb 10 

execute as @initiator[scores={Moneyz=65..}] run tell @s §aPurchased 10 Copper Bulbs!

execute as @initiator[scores={Moneyz=65..}] run scoreboard players remove @s Moneyz 65
