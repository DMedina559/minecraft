execute as @initiator[scores={Moneyz=..24}] run tell @s §cYou can't buy a Lead!

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou can buy a Lead!

execute as @initiator[scores={Moneyz=25..}] run give @s lead

execute as @initiator[scores={Moneyz=25..}] run tell @s §aPurchased a Lead!

execute as @initiator[scores={Moneyz=25..}] run scoreboard players remove @s Moneyz 25