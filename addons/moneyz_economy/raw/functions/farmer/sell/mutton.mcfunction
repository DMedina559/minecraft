tell @initiator[hasitem={item=mutton,quantity=..4}] §cYou can't sell 5 Raw Mutton!

tell @initiator[hasitem={item=mutton,quantity=5..}] §aYou can sell 5 Raw Mutton!

scoreboard players add @initiator[hasitem={item=mutton,quantity=5..}] Moneyz 25

tell @initiator[hasitem={item=mutton,quantity=5..}] §aSold 5 Raw Mutton!

clear @initiator[hasitem={item=mutton,quantity=5..}] mutton 0 5