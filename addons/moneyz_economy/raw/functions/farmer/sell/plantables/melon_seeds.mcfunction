playsound note.bassattack @initiator[hasitem={item=melon_seeds,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=melon_seeds,quantity=..4}] §cYou can't sell 5 Melon Seeds!

playsound random.levelup @initiator[hasitem={item=melon_seeds,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=melon_seeds,quantity=5..}] §aYou can sell 5 Melon Seeds!

scoreboard players add @initiator[hasitem={item=melon_seeds,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=melon_seeds,quantity=5..}] §aSold 5 Melon Seeds!

clear @initiator[hasitem={item=melon_seeds,quantity=5..}] melon_seeds 0 5