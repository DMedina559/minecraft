playsound note.bassattack @initiator[scores={Moneyz=..29}] ~ ~ ~

execute as @initiator[scores={Moneyz=..29}] run tell @s §cYou can't buy a Carrot on a Stick!

execute as @initiator[scores={Moneyz=..29}] run tellraw @s {"rawtext": [{"text": "§cYou need 30 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=30..}] ~ ~ ~

execute as @initiator[scores={Moneyz=30..}] run tell @s §aYou can buy a Carrot on a Stick!

execute as @initiator[scores={Moneyz=30..}] run give @s carrot_on_a_stick

execute as @initiator[scores={Moneyz=30..}] run tell @s §aPurchased a Carrot on a Stick!

execute as @initiator[scores={Moneyz=30..}] run scoreboard players remove @s Moneyz 30