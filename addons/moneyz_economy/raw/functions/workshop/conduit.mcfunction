execute as @initiator[scores={Moneyz=..49}] run tell @s §cYou can't buy a Conduit!

execute as @initiator[scores={Moneyz=..49}] run tellraw @s {"rawtext": [{"text": "§cYou need 50 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=50..}] run tell @s §aYou can buy a Conduit!

execute as @initiator[scores={Moneyz=50..}] run give @s conduit

execute as @initiator[scores={Moneyz=50..}] run tell @s §aPurchased a Conduit!

execute as @initiator[scores={Moneyz=50..}] run scoreboard players remove @s Moneyz 50