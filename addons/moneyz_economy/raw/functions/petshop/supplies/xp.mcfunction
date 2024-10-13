execute as @initiator[scores={Moneyz=..34}] run tell @s §cYou can't buy an XP Level!

execute as @initiator[scores={Moneyz=..34}] run tellraw @s {"rawtext": [{"text": "§cYou need 35 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=35..}] run tell @s §aYou can buy an XP Level!

execute as @initiator[scores={Moneyz=35..}] run xp 1L @s

execute as @initiator[scores={Moneyz=35..}] run tell @s §aPurchased an XP Level!

execute as @initiator[scores={Moneyz=35..}] run scoreboard players remove @s Moneyz 35