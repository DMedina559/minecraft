execute as @initiator[scores={Moneyz=..499}] run tell @s §cYou can't buy S2002!

execute as @initiator[tag=s2002-commu] run tell @s §cYou already own S2002!

execute as @initiator[scores={Moneyz=500..},tag=!s2002-commu] run tell @s §aYou can buy S2002!

execute as @initiator[scores={Moneyz=500..},tag=!s2002-commu] run scoreboard players remove @s Moneyz 500

execute as @initiator[scores={Moneyz=500..},tag=!s2002-commu] run tag @s add s2002-commu

execute as @initiator[tag=s2002-commu,tag=!commuresident] run tag @s add commuresident

execute as @initiator[tag=s2002-commu,tag=commuresident] run tell @s §aPurchased S2002!
