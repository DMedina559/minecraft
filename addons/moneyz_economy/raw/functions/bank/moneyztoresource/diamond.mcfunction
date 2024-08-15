execute as @initiator[scores={Moneyz=..74}] run tell @s §cYou can't make this Exchange!

execute as @initiator[scores={Moneyz=75..}] run tell @s §aYou can make this Exchange!

execute as @initiator[scores={Moneyz=75..}] run give @s diamond 1

execute as @initiator[scores={Moneyz=75..}] run tell @s §aYou Exchanged 1 Diamond for 75 Moneyz!

execute as @initiator[scores={Moneyz=75..}] run scoreboard players remove @s Moneyz 75
