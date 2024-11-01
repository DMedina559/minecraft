playsound note.bassattack @initiator[hasitem={item=pumpkin_seeds,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=pumpkin_seeds,quantity=..4}] §cYou can't sell 5 Pumpkin Seeds!

playsound random.levelup @initiator[hasitem={item=pumpkin_seeds,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=pumpkin_seeds,quantity=5..}] §aYou can sell 5 Pumpkin Seeds!

scoreboard players add @initiator[hasitem={item=pumpkin_seeds,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=pumpkin_seeds,quantity=5..}] §aSold 5 Pumpkin Seeds!

clear @initiator[hasitem={item=pumpkin_seeds,quantity=5..}] pumpkin_seeds 0 5