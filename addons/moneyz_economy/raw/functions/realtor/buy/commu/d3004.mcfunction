execute as @initiator[scores={Moneyz=..749}] run tell @s §cYou can't buy D3004!

execute as @initiator[tag=d3004-commu] run tell @s §cYou already own D3004!

execute as @initiator[scores={Moneyz=750..},tag=!d3004-commu] run tell @s §aYou can buy D3004!

execute as @initiator[scores={Moneyz=750..},tag=!d3004-commu] run scoreboard players remove @s Moneyz 750

execute as @initiator[scores={Moneyz=750..},tag=!d3004-commu] run tag @s add d3004-commu

execute as @initiator[tag=d3004-commu,tag=!commuresident] run tag @s add commuresident

execute as @initiator[tag=d3004-commu,tag=commuresident] run tell @s §aPurchased D3004!
