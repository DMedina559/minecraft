execute as @initiator[scores={Moneyz=..9}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..9}] run tell @s §cYou can't buy 5 Books!

execute as @initiator[scores={Moneyz=..9}] run tellraw @s {"rawtext": [{"text": "§cYou need 10 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=10..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=10..}] run tell @s §aYou can buy 5 Books!

execute as @initiator[scores={Moneyz=10..}] run give @s book 5

execute as @initiator[scores={Moneyz=10..}] run tell @s §aPurchased 5 Books!

execute as @initiator[scores={Moneyz=10..}] run scoreboard players remove @s Moneyz 10