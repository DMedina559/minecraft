execute as @initiator[scores={Moneyz=..499}] run tell @s §cYou can't buy S2002!

execute as @initiator[tag=s2002-resh] run tell @s §cYou already own S2002!

execute as @initiator[scores={Moneyz=500..},tag=!s2002-resh] run tell @s §aYou can buy S2002!

execute as @initiator[scores={Moneyz=500..},tag=!s2002-resh] run scoreboard players remove @s Moneyz 500

execute as @initiator[scores={Moneyz=500..},tag=!s2002-resh] run tag @s add s2002-resh

execute as @initiator[tag=s2002-resh,tag=!reshresident] run tag @s add reshresident

execute as @initiator[tag=s2002-resh,tag=reshresident] run tell @s §aPurchased S2002!
