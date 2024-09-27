execute as @initiator[hasitem={item=copper_ingot,quantity=0}] run tell @s §cYou can't make this Exchange!

execute as @initiator[hasitem={item=copper_ingot,quantity=1..}] run tell @s §aYou can make this Exchange!

execute as @initiator[hasitem={item=copper_ingot,quantity=1..}] run scoreboard players add @s Moneyz 10

execute as @initiator[hasitem={item=copper_ingot,quantity=1..}] run tell @s §aYou Exchanged 1 Copper for 10 Moneyz!

execute as @initiator[hasitem={item=copper_ingot,quantity=1..}] run clear @s copper_ingot 0 1
