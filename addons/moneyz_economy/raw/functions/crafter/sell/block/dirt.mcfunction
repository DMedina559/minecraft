playsound note.bassattack @initiator[hasitem={item=dirt,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=dirt,quantity=..4}] §cYou can't sell 5 Dirts!

playsound random.levelup @initiator[hasitem={item=dirt,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=dirt,quantity=5..}] §aYou can sell 5 Dirts!

scoreboard players add @initiator[hasitem={item=dirt,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=dirt,quantity=5..}] §aSold 5 Dirts!

clear @initiator[hasitem={item=dirt,quantity=5..}] dirt 0 5