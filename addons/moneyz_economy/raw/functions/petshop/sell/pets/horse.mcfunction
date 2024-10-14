playsound note.bassattack @initiator[hasitem={item=horse_spawn_egg,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=horse_spawn_egg,quantity=..0}] §cYou can't sell a Horse Spawn Egg!

playsound random.levelup @initiator[hasitem={item=horse_spawn_egg,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=horse_spawn_egg,quantity=1..}] §aYou can sell a Horse Spawn Egg!

scoreboard players add @initiator[hasitem={item=horse_spawn_egg,quantity=1..}] Moneyz 60

tell @initiator[hasitem={item=horse_spawn_egg,quantity=1..}] §aSold a Horse Spawn Egg!

clear @initiator[hasitem={item=horse_spawn_egg,quantity=1..}] horse_spawn_egg 0 1