playsound note.bassattack @initiator[hasitem={item=wheat_seeds,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=wheat_seeds,quantity=..4}] §cYou can't sell 5 Wheat Seeds!

playsound random.levelup @initiator[hasitem={item=wheat_seeds,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=wheat_seeds,quantity=5..}] §aYou can sell 5 Wheat Seeds!

scoreboard players add @initiator[hasitem={item=wheat_seeds,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=wheat_seeds,quantity=5..}] §aSold 5 Wheat Seeds!

clear @initiator[hasitem={item=wheat_seeds,quantity=5..}] wheat_seeds 0 5