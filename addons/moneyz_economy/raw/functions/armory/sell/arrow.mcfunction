playsound note.bassattack @initiator[hasitem={item=arrow,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=arrow,quantity=..9}] §cYou can't sell 10 Arrows!

playsound random.levelup @initiator[hasitem={item=arrow,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=arrow,quantity=10..}] §aYou can sell 10 Arrows!

scoreboard players add @initiator[hasitem={item=arrow,quantity=10..}] Moneyz 50

tell @initiator[hasitem={item=arrow,quantity=10..}] §aSold 10 Arrows!

clear @initiator[hasitem={item=arrow,quantity=10..}] arrow 0 10