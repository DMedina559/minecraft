execute as @initiator[scores={Moneyz=..499}] run tell @s §cYou can't buy S2004!

execute as @initiator[tag=s2004] run tell @s §cYou already own S2004!

execute as @initiator[scores={Moneyz=500..},tag=!s2004] run tell @s §aYou can buy S2004!

execute as @initiator[scores={Moneyz=500..},tag=!s2004] run scoreboard players remove @s Moneyz 500

execute as @initiator[scores={Moneyz=500..},tag=!s2004] run tag @s add s2004

execute as @initiator[tag=s2004,tag=!resident] run tag @s add resident

execute as @initiator[tag=s2004,tag=resident] run tell @s §aPurchased S2004!
