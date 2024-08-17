execute as @initiator[scores={Moneyz=..19}] run tell @s §cYou can't buy 20 Bread!

execute as @initiator[scores={Moneyz=20..}] run tell @s §aYou can buy 20 Bread!

execute as @initiator[scores={Moneyz=20..}] run give @s bread 10

execute as @initiator[scores={Moneyz=20..}] run tell @s §aPurchased 20 Bread!

execute as @initiator[scores={Moneyz=20..}] run scoreboard players remove @s Moneyz 20