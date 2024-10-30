playsound note.bassattack @initiator[hasitem={item=diamond_sword,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=diamond_sword,quantity=..0}] §cYou can't sell a Diamond Sword!

playsound random.levelup @initiator[hasitem={item=diamond_sword,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=diamond_sword,quantity=1..}] §aYou can sell a Diamond Sword!

scoreboard players add @initiator[hasitem={item=diamond_sword,quantity=1..}] Moneyz 500

tell @initiator[hasitem={item=diamond_sword,quantity=1..}] §aSold a Diamond Sword!

clear @initiator[hasitem={item=diamond_sword,quantity=1..}] diamond_sword -1 1