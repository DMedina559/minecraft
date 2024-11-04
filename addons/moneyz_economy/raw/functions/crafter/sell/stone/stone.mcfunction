playsound note.bassattack @initiator[hasitem={item=stone,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=stone,quantity=..9}] §cYou can't sell 10 Stone!

playsound random.levelup @initiator[hasitem={item=stone,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=stone,quantity=10..}] §aYou can sell 10 Stone!

scoreboard players add @initiator[hasitem={item=stone,quantity=10..}] Moneyz 10

tell @initiator[hasitem={item=stone,quantity=10..}] §aSold 10 Stone!

clear @initiator[hasitem={item=stone,quantity=10..}] stone 0 10