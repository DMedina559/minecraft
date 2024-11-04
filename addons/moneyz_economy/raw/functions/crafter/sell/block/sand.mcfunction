playsound note.bassattack @initiator[hasitem={item=sand,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=sand,quantity=..4}] §cYou can't sell 5 Sands!

playsound random.levelup @initiator[hasitem={item=sand,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=sand,quantity=5..}] §aYou can sell 5 Sands!

scoreboard players add @initiator[hasitem={item=sand,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=sand,quantity=5..}] §aSold 5 Sands!

clear @initiator[hasitem={item=sand,quantity=5..}] sand 0 5