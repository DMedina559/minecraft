execute as @initiator[scores={Moneyz=..249}] run tell @s §cYou can't buy W1002!

execute as @initiator[tag=w1002-resh] run tell @s §cYou already own W1002!

execute as @initiator[scores={Moneyz=250..},tag=!w1002-resh] run tell @s §aYou can buy W1002!

execute as @initiator[scores={Moneyz=250..},tag=!w1002-resh] run scoreboard players remove @s Moneyz 250

execute as @initiator[scores={Moneyz=250..},tag=!w1002-resh] run tag @s add w1002-resh

execute as @initiator[tag=w1002-resh,tag=!reshresident] run tag @s add reshresident

execute as @initiator[tag=w1002-resh,tag=reshresident] run tell @s §aPurchased W1002!