execute as @initiator[scores={Moneyz=..24}] run tell @s §cYou can't buy a Milk Bucket!

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou can buy a Milk Bucket!

execute as @initiator[scores={Moneyz=25..}] run give @s milk_bucket

execute as @initiator[scores={Moneyz=25..}] run tell @s §aPurchased a Milk Bucket!

execute as @initiator[scores={Moneyz=25..}] run scoreboard players remove @s Moneyz 25