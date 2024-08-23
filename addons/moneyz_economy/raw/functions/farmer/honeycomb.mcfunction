execute as @initiator[scores={Moneyz=..9}] run tellraw @s {"rawtext": [{"text": "§cYou need 10 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=10..}] run tell @s §aYou can buy 10 Honeycombs!

execute as @initiator[scores={Moneyz=10..}] run give @s honeycomb 10

execute as @initiator[scores={Moneyz=10..}] run tell @s §aPurchased 10 Honeycombs!

execute as @initiator[scores={Moneyz=10..}] run scoreboard players remove @s Moneyz 10