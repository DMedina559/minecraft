execute as @initiator[scores={Moneyz=..749}] run tell @s §cYou can't buy I3002!

execute as @initiator[tag=i3002-resh] run tell @s §cYou already own I3002!

execute as @initiator[scores={Moneyz=750..},tag=!i3002-resh] run tell @s §aYou can buy I3002!

execute as @initiator[scores={Moneyz=750..},tag=!i3002-resh] run scoreboard players remove @s Moneyz 750

execute as @initiator[scores={Moneyz=750..},tag=!i3002-resh] run tag @s add i3002-resh

execute as @initiator[tag=i3002-resh,tag=!reshresident] run tag @s add reshresident

execute as @initiator[tag=i3002-resh,tag=reshresident] run tell @s §aPurchased I3002!
