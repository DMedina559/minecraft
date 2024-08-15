execute as @initiator[scores={Moneyz=..249}] run tell @s §cYou can't buy W1003!

execute as @initiator[tag=w1003-resh] run tell @s §cYou already own W1003!

execute as @initiator[scores={Moneyz=250..},tag=!w1003-resh] run tell @s §aYou can buy W1003!

execute as @initiator[scores={Moneyz=250..},tag=!w1003-resh] run scoreboard players remove @s Moneyz 250

execute as @initiator[scores={Moneyz=250..},tag=!w1003-resh] run tag @s add w1003-resh

execute as @initiator[tag=w1003-resh,tag=!reshresident] run tag @s add reshresident

execute as @initiator[tag=w1003-resh,tag=reshresident] run tell @s §aPurchased W1003!