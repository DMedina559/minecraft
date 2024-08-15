execute as @initiator[scores={Moneyz=..249}] run tell @s §cYou can't buy W1004!

execute as @initiator[tag=w1004-resh] run tell @s §cYou already own W1004!

execute as @initiator[scores={Moneyz=250..},tag=!w1004-resh] run tell @s §aYou can buy W1004!

execute as @initiator[scores={Moneyz=250..},tag=!w1004-resh] run scoreboard players remove @s Moneyz 250

execute as @initiator[scores={Moneyz=250..},tag=!w1004-resh] run tag @s add w1004-resh

execute as @initiator[tag=w1004-resh,tag=!reshresident] run tag @s add reshresident

execute as @initiator[tag=w1004-resh,tag=reshresident] run tell @s §aPurchased W1004!