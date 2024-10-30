playsound note.bassattack @initiator[hasitem={item=iron_hoe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=iron_hoe,quantity=..0}] §cYou can't sell a Iron Hoe!

playsound random.levelup @initiator[hasitem={item=iron_hoe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=iron_hoe,quantity=1..}] §aYou can sell a Iron Hoe!

scoreboard players add @initiator[hasitem={item=iron_hoe,quantity=1..}] Moneyz 350

tell @initiator[hasitem={item=iron_hoe,quantity=1..}] §aSold a Iron Hoe!

clear @initiator[hasitem={item=iron_hoe,quantity=1..}] iron_hoe -1 1