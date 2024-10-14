playsound note.bassattack @initiator[hasitem={item=egg,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=egg,quantity=..9}] §cYou can't sell 10 Eggs!

playsound random.levelup @initiator[hasitem={item=egg,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=egg,quantity=10..}] §aYou can sell 10 Eggs!

scoreboard players add @initiator[hasitem={item=egg,quantity=10..}] Moneyz 10

tell @initiator[hasitem={item=egg,quantity=10..}] §aSold 10 Eggs!

clear @initiator[hasitem={item=egg,quantity=10..}] egg 0 10