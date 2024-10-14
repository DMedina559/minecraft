playsound note.bassattack @initiator[hasitem={item=axolotl_spawn_egg,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=axolotl_spawn_egg,quantity=..0}] §cYou can't sell an Axolotl Spawn Egg!

playsound random.levelup @initiator[hasitem={item=axolotl_spawn_egg,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=axolotl_spawn_egg,quantity=1..}] §aYou can sell an Axolotl Spawn Egg!

scoreboard players add @initiator[hasitem={item=axolotl_spawn_egg,quantity=1..}] Moneyz 100

tell @initiator[hasitem={item=axolotl_spawn_egg,quantity=1..}] §aSold an Axolotl Spawn Egg!

clear @initiator[hasitem={item=axolotl_spawn_egg,quantity=1..}] axolotl_spawn_egg 0 1