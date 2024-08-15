execute as @initiator[scores={Moneyz=..749}] run tell @s §cYou can't buy I3005!

execute as @initiator[tag=i3005-resh] run tell @s §cYou already own I3005!

execute as @initiator[scores={Moneyz=750..},tag=!i3005-resh] run tell @s §aYou can buy I3005!

execute as @initiator[scores={Moneyz=750..},tag=!i3005-resh] run scoreboard players remove @s Moneyz 750

execute as @initiator[scores={Moneyz=750..},tag=!i3005-resh] run tag @s add i3005-resh

execute as @initiator[tag=i3005-resh,tag=!reshresident] run tag @s add reshresident

execute as @initiator[tag=i3005-resh,tag=reshresident] run tell @s §aPurchased I3005!
