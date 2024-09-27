execute as @initiator[scores={Moneyz=..24}] run tell @s §cYou can't buy 64 Wind Charges!

execute as @initiator[scores={Moneyz=..24}] run tellraw @s {"rawtext": [{"text": "§cYou need 25 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou can buy 64 Wind Charges!

execute as @initiator[scores={Moneyz=25..}] run give @s wind_charge 64

execute as @initiator[scores={Moneyz=25..}] run tell @s §aPurchased 64 Wind Charges!

execute as @initiator[scores={Moneyz=25..}] run scoreboard players remove @s Moneyz 25