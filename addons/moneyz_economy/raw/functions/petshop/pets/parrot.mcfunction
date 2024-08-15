execute as @initiator[scores={Moneyz=..24}] run tell @s §cYou can't buy a Parrot!

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou can buy a Parrot!

execute as @initiator[scores={Moneyz=25..}] run give @s parrot_spawn_egg

execute as @initiator[scores={Moneyz=25..}] run tell @s §aPurchased a Parrot!

execute as @initiator[scores={Moneyz=25..}] run scoreboard players remove @s Moneyz 25