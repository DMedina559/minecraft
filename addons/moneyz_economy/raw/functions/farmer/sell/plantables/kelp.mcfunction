playsound note.bassattack @initiator[hasitem={item=kelp,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=kelp,quantity=..4}] §cYou can't sell 5 Kelp!

playsound random.levelup @initiator[hasitem={item=kelp,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=kelp,quantity=5..}] §aYou can sell 5 Kelp!

scoreboard players add @initiator[hasitem={item=kelp,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=kelp,quantity=5..}] §aSold 5 Kelp!

clear @initiator[hasitem={item=kelp,quantity=5..}] kelp 0 5