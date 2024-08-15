execute as @initiator[scores={Moneyz=..39}] run tell @s §cYou can't buy a Cat!

execute as @initiator[scores={Moneyz=40..}] run tell @s §aYou can buy a Cat!

execute as @initiator[scores={Moneyz=40..}] run give @s cat_spawn_egg

execute as @initiator[scores={Moneyz=40..}] run tell @s §aPurchased a Cat!

execute as @initiator[scores={Moneyz=40..}] run scoreboard players remove @s Moneyz 40