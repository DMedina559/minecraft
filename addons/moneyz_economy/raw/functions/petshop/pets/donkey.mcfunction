execute as @initiator[scores={Moneyz=..59}] run tellraw @s {"rawtext": [{"text": "§cYou need 60 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=60..}] run tell @s §aYou can buy a Donkey!

execute as @initiator[scores={Moneyz=60..}] run give @s donkey_spawn_egg

execute as @initiator[scores={Moneyz=60..}] run tell @s §aPurchased a Donkey!

execute as @initiator[scores={Moneyz=60..}] run scoreboard players remove @s Moneyz 60