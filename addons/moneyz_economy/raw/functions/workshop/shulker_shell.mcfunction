playsound note.bassattack @initiator[scores={Moneyz=..74}] ~ ~ ~

execute as @initiator[scores={Moneyz=..74}] run tell @s §cYou can't buy 2 Shulker Shells!

execute as @initiator[scores={Moneyz=..74}] run tellraw @s {"rawtext": [{"text": "§cYou need 75 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=75..}] ~ ~ ~

execute as @initiator[scores={Moneyz=75..}] run tell @s §aYou can buy 2 Shulker Shells!

execute as @initiator[scores={Moneyz=75..}] run give @s shulker_shell 2

execute as @initiator[scores={Moneyz=75..}] run tell @s §aPurchased 2 Shulker Shells!

execute as @initiator[scores={Moneyz=75..}] run scoreboard players remove @s Moneyz 75