playsound note.bassattack @initiator[hasitem={item=allium,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=allium,quantity=..4}] §cYou can't sell 5 Alliums!

playsound random.levelup @initiator[hasitem={item=allium,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=allium,quantity=5..}] §aYou can sell 5 Alliums!

scoreboard players add @initiator[hasitem={item=allium,quantity=5..}] Moneyz 15

tell @initiator[hasitem={item=allium,quantity=5..}] §aSold 5 Alliums!

clear @initiator[hasitem={item=allium,quantity=5..}] allium 0 5