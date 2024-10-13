playsound note.bassattack @initiator[scores={Moneyz=..49}] ~ ~ ~

execute as @initiator[scores={Moneyz=..49}] run tell @s §cYou can't buy 10 Arrows!

execute as @initiator[scores={Moneyz=..49}] run tellraw @s {"rawtext": [{"text": "§cYou need 50 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=50..}] ~ ~ ~

execute as @initiator[scores={Moneyz=50..}] run tell @s §aYou can buy 10 Arrows!

execute as @initiator[scores={Moneyz=50..}] run give @s arrow 10

execute as @initiator[scores={Moneyz=50..}] run tell @s §aPurchased 10 Arrows!

execute as @initiator[scores={Moneyz=50..}] run scoreboard players remove @s Moneyz 50