tell @initiator[hasitem={item=wheat_seeds,quantity=..4}] §cYou can't sell 5 Seeds!

tell @initiator[hasitem={item=wheat_seeds,quantity=5..}] §aYou can sell 5 Seeds!

scoreboard players add @initiator[hasitem={item=wheat_seeds,quantity=5..}] Moneyz 15

tell @initiator[hasitem={item=wheat_seeds,quantity=5..}] §aSold 5 Seeds!

clear @initiator[hasitem={item=wheat_seeds,quantity=5..}] wheat_seeds 0 5