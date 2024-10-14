playsound note.bassattack @initiator[hasitem={item=diamond_axe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=diamond_axe,quantity=..0}] §cYou can't sell a Diamond Axe!

playsound random.levelup @initiator[hasitem={item=diamond_axe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=diamond_axe,quantity=1..}] §aYou can sell a Diamond Axe!

scoreboard players add @initiator[hasitem={item=diamond_axe,quantity=1..}] Moneyz 600

tell @initiator[hasitem={item=diamond_axe,quantity=1..}] §aSold a Diamond Axe!

clear @initiator[hasitem={item=diamond_axe,quantity=1..}] diamond_axe 0 1