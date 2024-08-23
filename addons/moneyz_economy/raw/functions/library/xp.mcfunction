execute as @initiator[scores={Moneyz=..99}] run tellraw @s {"rawtext": [{"text": "§cYou need 100 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=100..}] run tell @s §aYou can buy 30 XP Levels!

execute as @initiator[scores={Moneyz=100..}] run xp 30L @s

execute as @initiator[scores={Moneyz=100..}] run tell @s §aPurchased 30 XP Levels!

execute as @initiator[scores={Moneyz=100..}] run scoreboard players remove @s Moneyz 100