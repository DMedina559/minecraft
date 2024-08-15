execute as @initiator[scores={Moneyz=..49}] run tell @s §cYou can't make this Exchange!

execute as @initiator[scores={Moneyz=50..}] run tell @s §aYou can make this Exchange!

execute as @initiator[scores={Moneyz=50..}] run give @s iron_ingot 1

execute as @initiator[scores={Moneyz=50..}] run tell @s §aYou Exchanged 1 Iron Ingot for 50
 Moneyz!

execute as @initiator[scores={Moneyz=50..}] run scoreboard players remove @s Moneyz 50
