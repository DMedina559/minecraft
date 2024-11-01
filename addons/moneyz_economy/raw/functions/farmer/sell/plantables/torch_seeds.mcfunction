playsound note.bassattack @initiator[hasitem={item=torchflower_seeds,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=torchflower_seeds,quantity=..0}] §cYou can't sell a Torchflower Seeds!

playsound random.levelup @initiator[hasitem={item=torchflower_seeds,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=torchflower_seeds,quantity=1..}] §aYou can sell a Torchflower Seeds!

scoreboard players add @initiator[hasitem={item=torchflower_seeds,quantity=1..}] Moneyz 10

tell @initiator[hasitem={item=torchflower_seeds,quantity=1..}] §aSold a Torchflower Seeds!

clear @initiator[hasitem={item=torchflower_seeds,quantity=1..}] torchflower_seeds 0 1