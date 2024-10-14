playsound note.bassattack @initiator[hasitem={item=salmon,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=salmon,quantity=..4}] §cYou can't sell 5 Raw Salmon!

playsound random.levelup @initiator[hasitem={item=salmon,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=salmon,quantity=5..}] §aYou can sell 5 Raw Salmon!

scoreboard players add @initiator[hasitem={item=salmon,quantity=5..}] Moneyz 15

tell @initiator[hasitem={item=salmon,quantity=5..}] §aSold 5 Raw Salmon!

clear @initiator[hasitem={item=salmon,quantity=5..}] salmon 0 5