execute as @initiator[scores={Moneyz=..14}] run tell @s §cYou can't buy a Seed!

execute as @initiator[scores={Moneyz=15..}] run tell @s §aYou can buy a Seed!

execute as @initiator[scores={Moneyz=15..}] run give @s wheat_seeds 5

execute as @initiator[scores={Moneyz=15..}] run tell @s §aPurchased a Seed!

execute as @initiator[scores={Moneyz=15..}] run scoreboard players remove @s Moneyz 15