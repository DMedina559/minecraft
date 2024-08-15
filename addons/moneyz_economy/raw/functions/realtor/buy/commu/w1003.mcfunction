execute as @initiator[scores={Moneyz=..249}] run tell @s §cYou can't buy W1003!

execute as @initiator[tag=w1003-commu] run tell @s §cYou already own W1003!

execute as @initiator[scores={Moneyz=250..},tag=!w1003-commu] run tell @s §aYou can buy W1003!

execute as @initiator[scores={Moneyz=250..},tag=!w1003-commu] run scoreboard players remove @s Moneyz 250

execute as @initiator[scores={Moneyz=250..},tag=!w1003-commu] run tag @s add w1003-commu

execute as @initiator[tag=w1003-commu,tag=!commuresident] run tag @s add commuresident

execute as @initiator[tag=w1003-commu,tag=commuresident] run tell @s §aPurchased W1003!