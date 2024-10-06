execute as @initiator[scores={Moneyz=..99}] run tell @s §cYou can't buy Gold Horse Armor!

execute as @initiator[scores={Moneyz=..99}] run tellraw @s {"rawtext": [{"text": "§cYou need 100 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=100..}] run tell @s §aYou can buy Gold Horse Armor!

execute as @initiator[scores={Moneyz=100..}] run give @s golden_horse_armor

execute as @initiator[scores={Moneyz=100..}] run tell @s §aPurchased Gold Horse Armor!

execute as @initiator[scores={Moneyz=100..}] run scoreboard players remove @s Moneyz 100