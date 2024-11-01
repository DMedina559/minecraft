playsound note.bassattack @initiator[scores={Moneyz=..99}] ~ ~ ~

execute as @initiator[scores={Moneyz=..99}] run tell @s §cYou can't buy 4 Phantom Membranes!

execute as @initiator[scores={Moneyz=..99}] run tellraw @s {"rawtext": [{"text": "§cYou need 100 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=100..}] ~ ~ ~

execute as @initiator[scores={Moneyz=100..}] run tell @s §aYou can buy 4 Phantom Membranes!

execute as @initiator[scores={Moneyz=100..}] run give @s phantom_membrane 4

execute as @initiator[scores={Moneyz=100..}] run tell @s §aPurchased 4 Phantom Membranes!

execute as @initiator[scores={Moneyz=100..}] run scoreboard players remove @s Moneyz 100