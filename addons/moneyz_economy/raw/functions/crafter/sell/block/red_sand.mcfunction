playsound note.bassattack @initiator[hasitem={item=red_sand,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=red_sand,quantity=..4}] §cYou can't sell 5 Red Sands!

playsound random.levelup @initiator[hasitem={item=red_sand,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=red_sand,quantity=5..}] §aYou can sell 5 Red Sands!

scoreboard players add @initiator[hasitem={item=red_sand,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=red_sand,quantity=5..}] §aSold 5 Red Sands!

clear @initiator[hasitem={item=red_sand,quantity=5..}] red_sand 0 5