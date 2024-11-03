playsound note.bassattack @initiator[hasitem={item=sunflower,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=sunflower,quantity=..4}] §cYou can't sell 5 Sunflowers!

playsound random.levelup @initiator[hasitem={item=sunflower,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=sunflower,quantity=5..}] §aYou can sell 5 Sunflowers!

scoreboard players add @initiator[hasitem={item=sunflower,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=sunflower,quantity=5..}] §aSold 5 Sunflowers!

clear @initiator[hasitem={item=sunflower,quantity=5..}] sunflower 0 5