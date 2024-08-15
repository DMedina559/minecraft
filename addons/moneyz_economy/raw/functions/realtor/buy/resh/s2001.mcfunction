execute as @initiator[scores={Moneyz=..499}] run tell @s §cYou can't buy S2001!

execute as @initiator[tag=s2001-resh] run tell @s §cYou already own S2001!

execute as @initiator[scores={Moneyz=500..},tag=!s2001-resh] run tell @s §aYou can buy S2001!

execute as @initiator[scores={Moneyz=500..},tag=!s2001-resh] run scoreboard players remove @s Moneyz 500

execute as @initiator[scores={Moneyz=500..},tag=!s2001-resh] run tag @s add s2001-resh

execute as @initiator[tag=s2001-resh,tag=!reshresident] run tag @s add reshresident

execute as @initiator[tag=s2001-resh,tag=reshresident] run tell @s §aPurchased S2001!
