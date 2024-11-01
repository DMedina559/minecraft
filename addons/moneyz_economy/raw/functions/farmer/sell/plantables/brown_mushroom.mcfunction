playsound note.bassattack @initiator[hasitem={item=brown_mushroom,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=brown_mushroom,quantity=..4}] §cYou can't sell 5 Brown Mushrooms!

playsound random.levelup @initiator[hasitem={item=brown_mushroom,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=brown_mushroom,quantity=5..}] §aYou can sell 5 Brown Mushrooms!

scoreboard players add @initiator[hasitem={item=brown_mushroom,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=brown_mushroom,quantity=5..}] §aSold 5 Brown Mushrooms!

clear @initiator[hasitem={item=brown_mushroom,quantity=5..}] brown_mushroom 0 5