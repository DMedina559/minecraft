tell @initiator[hasitem={item=strider_spawn_egg,quantity=..0}] §cYou can't sell a Strider Spawn Egg!

tell @initiator[hasitem={item=strider_spawn_egg,quantity=1..}] §aYou can sell a Strider Spawn Egg!

scoreboard players add @initiator[hasitem={item=strider_spawn_egg,quantity=1..}] Moneyz 80

tell @initiator[hasitem={item=strider_spawn_egg,quantity=1..}] §aSold a Strider Spawn Egg!

clear @initiator[hasitem={item=strider_spawn_egg,quantity=1..}] strider_spawn_egg 0 1