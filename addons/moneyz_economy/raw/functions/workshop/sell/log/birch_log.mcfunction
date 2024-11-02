playsound note.bassattack @initiator[hasitem={item=birch_log,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=birch_log,quantity=..4}] §cYou can't sell 5 Birch Logs!

playsound random.levelup @initiator[hasitem={item=birch_log,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=birch_log,quantity=5..}] §aYou can sell 5 Birch Logs!

scoreboard players add @initiator[hasitem={item=birch_log,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=birch_log,quantity=5..}] §aSold 5 Birch Logs!

clear @initiator[hasitem={item=birch_log,quantity=5..}] birch_log 0 5