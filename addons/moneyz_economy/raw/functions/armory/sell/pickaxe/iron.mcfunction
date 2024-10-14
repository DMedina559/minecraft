playsound note.bassattack @initiator[hasitem={item=iron_pickaxe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=iron_pickaxe,quantity=..0}] §cYou can't sell a Iron Pickaxe!

playsound random.levelup @initiator[hasitem={item=iron_pickaxe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=iron_pickaxe,quantity=1..}] §aYou can sell a Iron Pickaxe!

scoreboard players add @initiator[hasitem={item=iron_pickaxe,quantity=1..}] Moneyz 300

tell @initiator[hasitem={item=iron_pickaxe,quantity=1..}] §aSold a Iron Pickaxe!

clear @initiator[hasitem={item=iron_pickaxe,quantity=1..}] iron_pickaxe 0 1