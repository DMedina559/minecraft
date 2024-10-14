playsound note.bassattack @initiator[hasitem={item=honeycomb,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=honeycomb,quantity=..9}] §cYou can't sell 10 Honey Combs!

playsound random.levelup @initiator[hasitem={item=honeycomb,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=honeycomb,quantity=10..}] §aYou can sell 10 Honey Combs!

scoreboard players add @initiator[hasitem={item=honeycomb,quantity=10..}] Moneyz 10

tell @initiator[hasitem={item=honeycomb,quantity=10..}] §aSold 10 Honey Combs!

clear @initiator[hasitem={item=honeycomb,quantity=10..}] honeycomb 0 10