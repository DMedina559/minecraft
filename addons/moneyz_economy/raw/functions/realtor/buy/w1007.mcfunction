execute as @initiator[scores={Moneyz=..249}] run tell @s §cYou can't buy w1007!

execute as @initiator[scores={Moneyz=..249}] run tellraw @s {"rawtext": [{"text": "§cYou need 250 Moneyz for the downpayment\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[tag=w1007] run tell @s §cYou already own w1007!

execute as @initiator[scores={Moneyz=250..},tag=!w1007] run tell @s §aYou can buy w1007!

execute as @initiator[scores={Moneyz=250..},tag=!w1007] run tag @s add tmp

execute as @initiator[scores={Moneyz=250..},tag=!w1007,tag=tmp] run scoreboard players remove @s Moneyz 250

execute as @initiator[tag=!w1007,tag=tmp] run tag @s add w1007

execute as @initiator[tag=w1007,tag=tmp] run tag @s remove tmp

execute as @initiator[tag=w1007,tag=!resident] run tag @s add resident

execute as @initiator[tag=w1007,tag=resident] run tell @s §aPurchased w1007!
