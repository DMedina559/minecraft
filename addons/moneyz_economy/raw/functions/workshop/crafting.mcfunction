execute as @initiator[scores={Moneyz=..199}] run tell @s §cYou can't buy a Crafting Kit!

execute as @initiator[scores={Moneyz=200..}] run tell @s §aYou can buy a Crafting Kit!

execute as @initiator[scores={Moneyz=200..}] run clone ~ ~ ~ ~ ~ ~ ^ ^ ^

execute as @initiator[scores={Moneyz=200..}] run tell @s §aPurchased Crafting Kit!

execute as @initiator[scores={Moneyz=200..}] run scoreboard players remove @s Moneyz 200