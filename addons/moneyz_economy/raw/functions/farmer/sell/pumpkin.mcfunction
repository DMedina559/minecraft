playsound note.bassattack @initiator[hasitem={item=pumpkin,quantity=4..}] ~ ~ ~

tell @initiator[hasitem={item=pumpkin,quantity=..4}] §cYou can't sell 5 Pumpkins!

playsound random.levelup @initiator[hasitem={item=pumpkin,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=pumpkin,quantity=5..}] §aYou can sell 5 Pumpkins!

scoreboard players add @initiator[hasitem={item=pumpkin,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=pumpkin,quantity=5..}] §aSold 5 Pumpkins!

clear @initiator[hasitem={item=pumpkin,quantity=5..}] pumpkin 0 5