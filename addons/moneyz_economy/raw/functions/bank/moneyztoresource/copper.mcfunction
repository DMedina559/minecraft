execute as @initiator[scores={Moneyz=..9}] run tell @s §cYou can't make this Exchange!

execute as @initiator[scores={Moneyz=50..}] run tell @s §aYou can make this Exchange!

execute as @initiator[scores={Moneyz=50..}] run give @s copper_ingot 1

execute as @initiator[scores={Moneyz=50..}] run tell @s §aYou Exchanged 1 Copper Ingot for 10 Moneyz!

execute as @initiator[scores={Moneyz=50..}] run scoreboard players remove @s Moneyz 10
