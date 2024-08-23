execute as @initiator[scores={Moneyz=..499}] run tell @s §cYou can't buy S2001!

execute as @initiator[scores={Moneyz=..499}] run tellraw @s {"rawtext": [{"text": "§cYou need 500 Moneyz for the downpayment\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[tag=s2001] run tell @s §cYou already own S2001!

execute as @initiator[scores={Moneyz=500..},tag=!s2001] run tell @s §aYou can buy S2001!

execute as @initiator[scores={Moneyz=500..},tag=!s2001] run scoreboard players remove @s Moneyz 500

execute as @initiator[scores={Moneyz=500..},tag=!s2001] run tag @s add s2001

execute as @initiator[tag=s2001,tag=!resident] run tag @s add resident

execute as @initiator[tag=s2001,tag=resident] run tell @s §aPurchased S2001!
