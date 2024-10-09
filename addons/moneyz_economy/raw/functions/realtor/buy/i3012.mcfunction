execute as @initiator[scores={Moneyz=..749}] run tell @s §cYou can't buy i3012!

execute as @initiator[scores={Moneyz=..749}] run tellraw @s {"rawtext": [{"text": "§cYou need 750 Moneyz for the downpayment\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[tag=i3012] run tell @s §cYou already own i3012!

execute as @initiator[scores={Moneyz=750..},tag=!i3012] run tell @s §aYou can buy i3012!

execute as @initiator[scores={Moneyz=750..},tag=!i3012] run tag @s add tmp

execute as @initiator[scores={Moneyz=750..},tag=!i3012,tag=tmp] run scoreboard players remove @s Moneyz 750

execute as @initiator[tag=!i3012,tag=tmp] run tag @s add i3012

execute as @initiator[tag=i3012,tag=tmp] run tag @s remove tmp

execute as @initiator[tag=i3012,tag=!resident] run tag @s add resident

execute as @initiator[tag=i3012,tag=resident] run tell @s §aPurchased i3012!
