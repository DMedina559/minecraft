execute as @initiator[scores={Moneyz=..14}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..14}] run tell @s §cYou can't buy 5 Alliums!

execute as @initiator[scores={Moneyz=..14}] run tellraw @s {"rawtext": [{"text": "§cYou need 15 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=15..}] run tell @s §aYou can buy 5 Alliums!

execute as @initiator[scores={Moneyz=15..}] run give @s allium 5

execute as @initiator[scores={Moneyz=15..}] run tell @s §aPurchased 5 Alliums!

execute as @initiator[scores={Moneyz=15..}] run scoreboard players remove @s Moneyz 15