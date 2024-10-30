playsound note.bassattack @initiator[hasitem={item=iron_sword,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=iron_sword,quantity=..0}] §cYou can't sell a Iron Sword!

playsound random.levelup @initiator[hasitem={item=iron_sword,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=iron_sword,quantity=1..}] §aYou can sell a Iron Sword!

scoreboard players add @initiator[hasitem={item=iron_sword,quantity=1..}] Moneyz 400

tell @initiator[hasitem={item=iron_sword,quantity=1..}] §aSold a Iron Sword!

clear @initiator[hasitem={item=iron_sword,quantity=1..}] iron_sword -1 1