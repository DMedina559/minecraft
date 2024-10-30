playsound note.bassattack @initiator[hasitem={item=diamond_hoe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=diamond_hoe,quantity=..0}] §cYou can't sell a Diamond Hoe!

playsound random.levelup @initiator[hasitem={item=diamond_hoe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=diamond_hoe,quantity=1..}] §aYou can sell a Diamond Hoe!

scoreboard players add @initiator[hasitem={item=diamond_hoe,quantity=1..}] Moneyz 400

tell @initiator[hasitem={item=diamond_hoe,quantity=1..}] §aSold a Diamond Hoe!

clear @initiator[hasitem={item=diamond_hoe,quantity=1..}] diamond_hoe -1 1