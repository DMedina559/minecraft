execute as @initiator[scores={Moneyz=..24}] run tell @s §cYou can't make this Exchange!

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou can make this Exchange!

execute as @initiator[scores={Moneyz=25..}] run give @s gold_ingot 1

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou Exchanged 1 Gold Ingot for 25 Moneyz!

execute as @initiator[scores={Moneyz=25..}] run scoreboard players remove @s Moneyz 25
