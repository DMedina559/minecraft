execute as @initiator[scores={Moneyz=..29}] run tell @s §cYou can't buy a Pig!

execute as @initiator[scores={Moneyz=30..}] run tell @s §aYou can buy a Pig!

execute as @initiator[scores={Moneyz=30..}] run give @s pig_spawn_egg

execute as @initiator[scores={Moneyz=30..}] run tell @s §aPurchased a Pig!

execute as @initiator[scores={Moneyz=30..}] run scoreboard players remove @s Moneyz 30