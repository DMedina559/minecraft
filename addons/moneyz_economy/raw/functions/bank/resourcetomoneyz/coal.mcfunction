playsound note.bassattack @initiator[hasitem={item=coal,quantity=0}] ~ ~ ~

execute as @initiator[hasitem={item=coal,quantity=0}] run tell @s §cYou can't make this Exchange!

playsound random.levelup @initiator[hasitem={item=coal,quantity=1..}] ~ ~ ~

execute as @initiator[hasitem={item=coal,quantity=1..}] run tell @s §aYou can make this Exchange!

execute as @initiator[hasitem={item=coal,quantity=1..}] run scoreboard players add @s Moneyz 5

execute as @initiator[hasitem={item=coal,quantity=1..}] run tell @s §aYou Exchanged 1 Coal for 5 Moneyz!

execute as @initiator[hasitem={item=coal,quantity=1..}] run clear @s coal 0 1
