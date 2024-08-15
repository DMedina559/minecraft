execute as @initiator[scores={Moneyz=..999}] run tell @s §cYou can't buy E4003!

execute as @initiator[tag=e4003-commu] run tell @s §cYou already own E4003!

execute as @initiator[scores={Moneyz=1000..},tag=!e4003-commu] run tell @s §aYou can buy E4003!

execute as @initiator[scores={Moneyz=1000..},tag=!e4003-commu] run scoreboard players remove @s Moneyz 1000

execute as @initiator[scores={Moneyz=1000..},tag=!e4003-commu] run tag @s add e4003-commu

execute as @initiator[tag=e4003-commu,tag=!commuresident] run tag @s add commuresident

execute as @initiator[tag=e4003-commu,tag=commuresident] run tell @s §aPurchased E4003!
