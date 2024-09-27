execute as @initiator[hasitem={item=emerald,quantity=0}] run tell @s §cYou can't make this Exchange!

execute as @initiator[hasitem={item=emerald,quantity=1..}] run tell @s §aYou can make this Exchange!

execute as @initiator[hasitem={item=emerald,quantity=1..}] run scoreboard players add @s Moneyz 100

execute as @initiator[hasitem={item=emerald,quantity=1..}] run tell @s §aYou Exchanged 1 Emerald for 100 Moneyz!

execute as @initiator[hasitem={item=emerald,quantity=1..}] run clear @s emerald 0 1
