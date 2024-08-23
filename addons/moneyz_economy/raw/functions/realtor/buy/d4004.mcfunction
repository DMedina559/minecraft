execute as @initiator[scores={Moneyz=..999}] run tell @s §cYou can't buy D4004!

execute as @initiator[scores={Moneyz=..999}] run tellraw @s {"rawtext": [{"text": "§cYou need 1000 Moneyz for the downpayment\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[tag=d4004] run tell @s §cYou already own D4004!

execute as @initiator[scores={Moneyz=1000..},tag=!d4004] run tell @s §aYou can buy D4004!

execute as @initiator[scores={Moneyz=1000..},tag=!d4004] run scoreboard players remove @s Moneyz 1000

execute as @initiator[scores={Moneyz=1000..},tag=!d4004] run tag @s add d4004

execute as @initiator[tag=d4004,tag=!resident] run tag @s add resident

execute as @initiator[tag=d4004,tag=resident] run tell @s §aPurchased D4004!
