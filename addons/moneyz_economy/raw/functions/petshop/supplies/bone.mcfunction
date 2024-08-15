execute as @initiator[scores={Moneyz=..24}] run tell @s §cYou can't buy 5 Bones!

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou can buy 5 Bones!

execute as @initiator[scores={Moneyz=25..}] run give @s bone 5

execute as @initiator[scores={Moneyz=25..}] run tell @s §aPurchased 5 Bones!

execute as @initiator[scores={Moneyz=25..}] run scoreboard players remove @s Moneyz 25