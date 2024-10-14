playsound note.bassattack @initiator[hasitem={item=bread,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=bread,quantity=..9}] §cYou can't sell 10 Bread!

playsound random.levelup @initiator[hasitem={item=bread,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=bread,quantity=10..}] §aYou can sell 10 Bread!

scoreboard players add @initiator[hasitem={item=bread,quantity=10..}] Moneyz 20

tell @initiator[hasitem={item=bread,quantity=10..}] §aSold 10 Bread!

clear @initiator[hasitem={item=bread,quantity=10..}] bread 0 10