playsound note.bassattack @initiator[hasitem={item=beetroot_seeds,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=beetroot_seeds,quantity=..4}] §cYou can't sell 5 Beetroot Seeds!

playsound random.levelup @initiator[hasitem={item=beetroot_seeds,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=beetroot_seeds,quantity=5..}] §aYou can sell 5 Beetroot Seeds!

scoreboard players add @initiator[hasitem={item=beetroot_seeds,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=beetroot_seeds,quantity=5..}] §aSold 5 Beetroot Seeds!

clear @initiator[hasitem={item=beetroot_seeds,quantity=5..}] beetroot_seeds 0 5