execute as @initiator[scores={Moneyz=..29}] run tell @s §cYou can't buy an XP Level!

execute as @initiator[scores={Moneyz=30..}] run tell @s §aYou can buy an XP Level!

execute as @initiator[scores={Moneyz=30..}] run xp 1L @s

execute as @initiator[scores={Moneyz=30..}] run tell @s §aPurchased an XP Level!

execute as @initiator[scores={Moneyz=30..}] run scoreboard players remove @s Moneyz 30