tell @initiator[hasitem={item=parrot_spawn_egg,quantity=..0}] §cYou can't sell a Parrot Spawn Egg!

tell @initiator[hasitem={item=parrot_spawn_egg,quantity=1..}] §aYou can sell a Parrot Spawn Egg!

scoreboard players add @initiator[hasitem={item=parrot_spawn_egg,quantity=1..}] Moneyz 25

tell @initiator[hasitem={item=parrot_spawn_egg,quantity=1..}] §aSold a Parrot Spawn Egg!

clear @initiator[hasitem={item=parrot_spawn_egg,quantity=1..}] parrot_spawn_egg 0 1