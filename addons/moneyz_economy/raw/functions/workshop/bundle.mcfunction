playsound note.bassattack @initiator[scores={Moneyz=..4}] ~ ~ ~

execute as @initiator[scores={Moneyz=..4}] run tell @s §cYou can't buy a Bundle!

execute as @initiator[scores={Moneyz=..4}] run tellraw @s {"rawtext": [{"text": "§cYou need 5 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

playsound random.levelup @initiator[scores={Moneyz=5..}] ~ ~ ~

execute as @initiator[scores={Moneyz=5..}] run tell @s §aYou can buy a Bundle!

execute as @initiator[scores={Moneyz=5..}] run give @s bundle

execute as @initiator[scores={Moneyz=5..}] run tell @s §aPurchased a Bundle!

execute as @initiator[scores={Moneyz=5..}] run scoreboard players remove @s Moneyz 5