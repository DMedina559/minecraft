playsound note.bassattack @initiator[hasitem={item=bow,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=bow,quantity=..0}] §cYou can't sell a Bow!

playsound random.levelup @initiator[hasitem={item=bow,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=bow,quantity=1..}] §aYou can sell a Bow!

scoreboard players add @initiator[hasitem={item=bow,quantity=1..}] Moneyz 50

tell @initiator[hasitem={item=bow,quantity=1..}] §aSold a Bow!

clear @initiator[hasitem={item=bow,quantity=1..}] bow -1 1