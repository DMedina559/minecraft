playsound note.bassattack @initiator[hasitem={item=gold_ingot,quantity=0}] ~ ~ ~

execute as @initiator[hasitem={item=gold_ingot,quantity=0}] run tell @s §cYou can't make this Exchange!

playsound random.levelup @initiator[hasitem={item=gold_ingot,quantity=1..}] ~ ~ ~

execute as @initiator[hasitem={item=gold_ingot,quantity=1..}] run tell @s §aYou can make this Exchange!

execute as @initiator[hasitem={item=gold_ingot,quantity=1..}] run scoreboard players add @s Moneyz 25

execute as @initiator[hasitem={item=gold_ingot,quantity=1..}] run tell @s §aYou Exchanged 1 Gold for 25 Moneyz!

execute as @initiator[hasitem={item=gold_ingot,quantity=1..}] run clear @s gold_ingot 0 1
