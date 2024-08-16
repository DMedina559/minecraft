execute as @initiator[scores={Moneyz=..249}] run tell @s §cYou can't buy W1002!

execute as @initiator[tag=w1002] run tell @s §cYou already own W1002!

execute as @initiator[scores={Moneyz=250..},tag=!w1002] run tell @s §aYou can buy W1002!

execute as @initiator[scores={Moneyz=250..},tag=!w1002] run scoreboard players remove @s Moneyz 250

execute as @initiator[scores={Moneyz=250..},tag=!w1002] run tag @s add w1002

execute as @initiator[tag=w1002,tag=!resident] run tag @s add resident

execute as @initiator[tag=w1002,tag=resident] run tell @s §aPurchased W1002!