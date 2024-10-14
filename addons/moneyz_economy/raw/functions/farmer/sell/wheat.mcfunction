playsound note.bassattack @initiator[hasitem={item=wheat,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=wheat,quantity=..9}] §cYou can't sell 10 Wheats!

playsound random.levelup @initiator[hasitem={item=wheat,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=wheat,quantity=10..}] §aYou can sell 10 Wheats!

scoreboard players add @initiator[hasitem={item=wheat,quantity=10..}] Moneyz 15

tell @initiator[hasitem={item=wheat,quantity=10..}] §aSold 10 Wheats!

clear @initiator[hasitem={item=wheat,quantity=10..}] wheat 0 10