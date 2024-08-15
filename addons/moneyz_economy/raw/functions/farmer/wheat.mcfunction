execute as @initiator[scores={Moneyz=..14}] run tell @s §cYou can't buy 10 Wheats!

execute as @initiator[scores={Moneyz=15..}] run tell @s §aYou can buy 10 Wheats!

execute as @initiator[scores={Moneyz=15..}] run give @s wheat 10

execute as @initiator[scores={Moneyz=15..}] run tell @s §aPurchased 10 Wheats!

execute as @initiator[scores={Moneyz=15..}] run scoreboard players remove @s Moneyz 15