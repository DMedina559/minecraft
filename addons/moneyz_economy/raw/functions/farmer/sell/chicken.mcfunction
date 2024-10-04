tell @initiator[hasitem={item=chicken,quantity=..4}] §cYou can't sell 5 Raw Chickens!

tell @initiator[hasitem={item=chicken,quantity=5..}] §aYou can sell 5 Raw Chickens!

scoreboard players add @initiator[hasitem={item=chicken,quantity=5..}] Moneyz 20

tell @initiator[hasitem={item=chicken,quantity=5..}] §aSold 5 Raw Chickens!

clear @initiator[hasitem={item=chicken,quantity=5..}] chicken 0 5