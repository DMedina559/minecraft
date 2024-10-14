playsound note.bassattack @initiator[hasitem={item=mule_spawn_egg,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=mule_spawn_egg,quantity=..0}] §cYou can't sell a Mule Spawn Egg!

playsound random.levelup @initiator[hasitem={item=mule_spawn_egg,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=mule_spawn_egg,quantity=1..}] §aYou can sell a Mule Spawn Egg!

scoreboard players add @initiator[hasitem={item=mule_spawn_egg,quantity=1..}] Moneyz 60

tell @initiator[hasitem={item=mule_spawn_egg,quantity=1..}] §aSold a Mule Spawn Egg!

clear @initiator[hasitem={item=mule_spawn_egg,quantity=1..}] mule_spawn_egg 0 1