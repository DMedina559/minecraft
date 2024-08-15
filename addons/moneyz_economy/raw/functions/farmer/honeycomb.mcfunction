execute as @initiator[scores={Moneyz=..9}] run tell @s §cYou can't buy 10 Honeycombs!

execute as @initiator[scores={Moneyz=10..}] run tell @s §aYou can buy 10 Honeycombs!

execute as @initiator[scores={Moneyz=10..}] run give @s honeycomb 10

execute as @initiator[scores={Moneyz=10..}] run tell @s §aPurchased 10 Honeycombs!

execute as @initiator[scores={Moneyz=10..}] run scoreboard players remove @s Moneyz 10