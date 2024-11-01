playsound note.bassattack @initiator[hasitem={item=red_mushroom,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=red_mushroom,quantity=..4}] §cYou can't sell 5 Red Mushrooms!

playsound random.levelup @initiator[hasitem={item=red_mushroom,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=red_mushroom,quantity=5..}] §aYou can sell 5 Red Mushrooms!

scoreboard players add @initiator[hasitem={item=red_mushroom,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=red_mushroom,quantity=5..}] §aSold 5 Red Mushrooms!

clear @initiator[hasitem={item=red_mushroom,quantity=5..}] red_mushroom 0 5