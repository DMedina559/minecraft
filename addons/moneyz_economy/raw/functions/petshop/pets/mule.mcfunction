execute as @initiator[scores={Moneyz=..59}] run tell @s §cYou can't buy a Mule!

execute as @initiator[scores={Moneyz=60..}] run tell @s §aYou can buy a Mule!

execute as @initiator[scores={Moneyz=60..}] run give @s mule_spawn_egg

execute as @initiator[scores={Moneyz=60..}] run tell @s §aPurchased a Mule!

execute as @initiator[scores={Moneyz=60..}] run scoreboard players remove @s Moneyz 60