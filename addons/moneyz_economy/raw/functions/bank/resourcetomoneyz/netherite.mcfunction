execute as @initiator[hasitem={item=netherite_ingot,quantity=0}] run tell @s §cYou can't make this Exchange!

execute as @initiator[hasitem={item=netherite_ingot,quantity=1..}] run tell @s §aYou can make this Exchange!

execute as @initiator[hasitem={item=netherite_ingot,quantity=1..}] run scoreboard players add @s Moneyz 1000

execute as @initiator[hasitem={item=netherite_ingot,quantity=1..}] run tell @s §aYou Exchanged 1 Netherite Ingot for 1,000 Moneyz!

execute as @initiator[hasitem={item=netherite_ingot,quantity=1..}] run clear @s netherite_ingot 0 1
