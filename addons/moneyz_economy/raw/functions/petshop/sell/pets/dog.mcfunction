playsound note.bassattack @initiator[hasitem={item=wolf_spawn_egg,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=wolf_spawn_egg,quantity=..0}] §cYou can't sell a Wolf Spawn Egg!

playsound random.levelup @initiator[hasitem={item=wolf_spawn_egg,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=wolf_spawn_egg,quantity=1..}] §aYou can sell a Wolf Spawn Egg!

scoreboard players add @initiator[hasitem={item=wolf_spawn_egg,quantity=1..}] Moneyz 40

tell @initiator[hasitem={item=wolf_spawn_egg,quantity=1..}] §aSold a Wolf Spawn Egg!

clear @initiator[hasitem={item=wolf_spawn_egg,quantity=1..}] wolf_spawn_egg 0 1