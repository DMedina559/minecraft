execute as @initiator[scores={Moneyz=..9}] run tell @s §cYou can't buy a Honey Bottle!

execute as @initiator[scores={Moneyz=10..}] run tell @s §aYou can buy a Honey Bottle!

execute as @initiator[scores={Moneyz=10..}] run give @s honey_bottle 1

execute as @initiator[scores={Moneyz=10..}] run tell @s §aPurchased a Honey Bottles!

execute as @initiator[scores={Moneyz=10..}] run scoreboard players remove @s Moneyz 10