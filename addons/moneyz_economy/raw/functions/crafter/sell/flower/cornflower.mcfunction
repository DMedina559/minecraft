playsound note.bassattack @initiator[hasitem={item=cornflower,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=cornflower,quantity=..4}] §cYou can't sell 5 Cornflowers!

playsound random.levelup @initiator[hasitem={item=cornflower,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=cornflower,quantity=5..}] §aYou can sell 5 Cornflowers!

scoreboard players add @initiator[hasitem={item=cornflower,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=cornflower,quantity=5..}] §aSold 5 Cornflowers!

clear @initiator[hasitem={item=cornflower,quantity=5..}] cornflower 0 5