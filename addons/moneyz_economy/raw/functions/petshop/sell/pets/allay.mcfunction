tell @initiator[hasitem={item=allay_spawn_egg,quantity=..0}] §cYou can't sell an Allay Spawn Egg!

tell @initiator[hasitem={item=allay_spawn_egg,quantity=1..}] §aYou can sell an Allay Spawn Egg!

scoreboard players add @initiator[hasitem={item=allay_spawn_egg,quantity=1..}] Moneyz 100

tell @initiator[hasitem={item=allay_spawn_egg,quantity=1..}] §aSold an Allay Spawn Egg!

clear @initiator[hasitem={item=allay_spawn_egg,quantity=1..}] allay_spawn_egg 0 1