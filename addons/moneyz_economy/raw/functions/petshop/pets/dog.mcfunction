execute as @initiator[scores={Moneyz=..39}] run tell @s §cYou can't buy a Dog!

execute as @initiator[scores={Moneyz=40..}] run tell @s §aYou can buy a Dog!

execute as @initiator[scores={Moneyz=40..}] run give @s wolf_spawn_egg

execute as @initiator[scores={Moneyz=40..}] run tell @s §aPurchased Dog!

execute as @initiator[scores={Moneyz=40..}] run scoreboard players remove @s Moneyz 40