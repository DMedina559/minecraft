execute as @initiator[scores={Moneyz=..29}] run tell @s §cYou can't buy a Saddle!

execute as @initiator[scores={Moneyz=30..}] run tell @s §aYou can buy a Saddle!

execute as @initiator[scores={Moneyz=30..}] run give @s saddle

execute as @initiator[scores={Moneyz=30..}] run tell @s §aPurchased a Saddle!

execute as @initiator[scores={Moneyz=30..}] run scoreboard players remove @s Moneyz 30