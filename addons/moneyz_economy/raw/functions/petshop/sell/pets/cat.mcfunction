tell @initiator[hasitem={item=cat_spawn_egg,quantity=..0}] §cYou can't sell a Cat Spawn Egg!

tell @initiator[hasitem={item=cat_spawn_egg,quantity=1..}] §aYou can sell a Cat Spawn Egg!

scoreboard players add @initiator[hasitem={item=cat_spawn_egg,quantity=1..}] Moneyz 40

tell @initiator[hasitem={item=cat_spawn_egg,quantity=1..}] §aSold a Cat Spawn Egg!

clear @initiator[hasitem={item=cat_spawn_egg,quantity=1..}] cat_spawn_egg 0 1