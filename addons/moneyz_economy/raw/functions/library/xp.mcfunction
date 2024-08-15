execute as @initiator[scores={Moneyz=..99}] run tell @s §cYou can't buy 30 XP Levels!

execute as @initiator[scores={Moneyz=100..}] run tell @s §aYou can buy 30 XP Levels!

execute as @initiator[scores={Moneyz=100..}] run xp 30L @s

execute as @initiator[scores={Moneyz=100..}] run tell @s §aPurchased 30 XP Levels!

execute as @initiator[scores={Moneyz=100..}] run scoreboard players remove @s Moneyz 100