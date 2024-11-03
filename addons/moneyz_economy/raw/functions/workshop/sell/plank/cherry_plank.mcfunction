playsound note.bassattack @initiator[hasitem={item=cherry_plank,quantity=..19}] ~ ~ ~

tell @initiator[hasitem={item=cherry_plank,quantity=..19}] §cYou can't sell 20 Cherry Planks!

playsound random.levelup @initiator[hasitem={item=cherry_plank,quantity=20..}] ~ ~ ~

tell @initiator[hasitem={item=cherry_plank,quantity=20..}] §aYou can sell 20 Cherry Planks!

scoreboard players add @initiator[hasitem={item=cherry_plank,quantity=20..}] Moneyz 10

tell @initiator[hasitem={item=cherry_plank,quantity=20..}] §aSold 20 Cherry Planks!

clear @initiator[hasitem={item=cherry_plank,quantity=20..}] cherry_plank 0 20