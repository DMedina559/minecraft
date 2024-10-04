tell @initiator[hasitem={item=rabbit,quantity=..4}] §cYou can't sell 5 Raw Rabbits!

tell @initiator[hasitem={item=rabbit,quantity=5..}] §aYou can sell 5 Raw Rabbits!

scoreboard players add @initiator[hasitem={item=rabbit,quantity=5..}] Moneyz 20

tell @initiator[hasitem={item=rabbit,quantity=5..}] §aSold 5 Raw Rabbits!

clear @initiator[hasitem={item=rabbit,quantity=5..}] rabbit 0 5