execute as @initiator[scores={Moneyz=..499}] run tell @s §cYou can't buy S2004!

execute as @initiator[tag=s2004-commu] run tell @s §cYou already own S2004!

execute as @initiator[scores={Moneyz=500..},tag=!s2004-commu] run tell @s §aYou can buy S2004!

execute as @initiator[scores={Moneyz=500..},tag=!s2004-commu] run scoreboard players remove @s Moneyz 500

execute as @initiator[scores={Moneyz=500..},tag=!s2004-commu] run tag @s add s2004-commu

execute as @initiator[tag=s2004-commu,tag=!commuresident] run tag @s add commuresident

execute as @initiator[tag=s2004-commu,tag=commuresident] run tell @s §aPurchased S2004!
