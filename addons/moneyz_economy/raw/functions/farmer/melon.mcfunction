execute as @initiator[scores={Moneyz=..4}] run tell @s §cYou can't buy 10 Melons!

execute as @initiator[scores={Moneyz=5..}] run tell @s §aYou can buy 10 Melons!

execute as @initiator[scores={Moneyz=5..}] run give @s melon 10

execute as @initiator[scores={Moneyz=5..}] run tell @s §aPurchased 10 Melons!

execute as @initiator[scores={Moneyz=5..}] run scoreboard players remove @s Moneyz 5