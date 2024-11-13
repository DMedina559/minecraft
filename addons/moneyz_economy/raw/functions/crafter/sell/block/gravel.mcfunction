playsound note.bassattack @initiator[hasitem={item=gravel,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=gravel,quantity=..9}] §cYou can't sell 10 Gravels!

playsound random.levelup @initiator[hasitem={item=gravel,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=gravel,quantity=10..}] §aYou can sell 10 Gravels!

scoreboard players add @initiator[hasitem={item=gravel,quantity=10..}] Moneyz 5

tell @initiator[hasitem={item=gravel,quantity=10..}] §aSold 10 Gravels!

clear @initiator[hasitem={item=gravel,quantity=10..}] gravel 0 10