execute as @initiator[scores={Moneyz=..499}] run tell @s §cYou can't buy S2004!

execute as @initiator[tag=s2004-resh] run tell @s §cYou already own S2004!

execute as @initiator[scores={Moneyz=500..},tag=!s2004-resh] run tell @s §aYou can buy S2004!

execute as @initiator[scores={Moneyz=500..},tag=!s2004-resh] run scoreboard players remove @s Moneyz 500

execute as @initiator[scores={Moneyz=500..},tag=!s2004-resh] run tag @s add s2004-resh

execute as @initiator[tag=s2004-resh,tag=!reshresident] run tag @s add reshresident

execute as @initiator[tag=s2004-resh,tag=reshresident] run tell @s §aPurchased S2004!
