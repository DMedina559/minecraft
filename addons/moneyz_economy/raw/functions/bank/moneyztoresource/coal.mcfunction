execute as @initiator[scores={Moneyz=..4}] run tell @s §cYou can't make this Exchange!

execute as @initiator[scores={Moneyz=5..}] run tell @s §aYou can make this Exchange!

execute as @initiator[scores={Moneyz=5..}] run give @s coal 1

execute as @initiator[scores={Moneyz=5..}] run tell @s §aYou Exchanged 1 Coal for 5 Moneyz!

execute as @initiator[scores={Moneyz=5..}] run scoreboard players remove @s Moneyz 5
