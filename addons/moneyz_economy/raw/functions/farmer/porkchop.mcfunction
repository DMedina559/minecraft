playsound note.bassattack @initiator[scores={Moneyz=..14}] ~ ~ ~

execute as @initiator[scores={Moneyz=..14}] run tell @s §cYou can't buy 5 Raw Porkchops!

execute as @initiator[scores={Moneyz=..14}] run tellraw @s {"rawtext": [{"text": "§cYou need 15 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=15..}] ~ ~ ~

execute as @initiator[scores={Moneyz=15..}] run tell @s §aYou can buy 5 Raw Porkchops!

execute as @initiator[scores={Moneyz=15..}] run give @s porkchop 5

execute as @initiator[scores={Moneyz=15..}] run tell @s §aPurchased 5 Raw Porkchops!

execute as @initiator[scores={Moneyz=15..}] run scoreboard players remove @s Moneyz 15