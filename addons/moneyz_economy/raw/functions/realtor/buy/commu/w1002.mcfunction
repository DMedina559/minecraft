execute as @initiator[scores={Moneyz=..249}] run tell @s §cYou can't buy W1002!

execute as @initiator[tag=w1002-commu] run tell @s §cYou already own W1002!

execute as @initiator[scores={Moneyz=250..},tag=!w1002-commu] run tell @s §aYou can buy W1002!

execute as @initiator[scores={Moneyz=250..},tag=!w1002-commu] run scoreboard players remove @s Moneyz 250

execute as @initiator[scores={Moneyz=250..},tag=!w1002-commu] run tag @s add w1002-commu

execute as @initiator[tag=w1002-commu,tag=!commuresident] run tag @s add commuresident

execute as @initiator[tag=w1002-commu,tag=commuresident] run tell @s §aPurchased W1002!