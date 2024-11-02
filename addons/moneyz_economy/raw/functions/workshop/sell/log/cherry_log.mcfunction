playsound note.bassattack @initiator[hasitem={item=cherry_log,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=cherry_log,quantity=..4}] §cYou can't sell 5 Cherry Logs!

playsound random.levelup @initiator[hasitem={item=cherry_log,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=cherry_log,quantity=5..}] §aYou can sell 5 Cherry Logs!

scoreboard players add @initiator[hasitem={item=cherry_log,quantity=5..}] Moneyz 15

tell @initiator[hasitem={item=cherry_log,quantity=5..}] §aSold 5 Cherry Logs!

clear @initiator[hasitem={item=cherry_log,quantity=5..}] cherry_log 0 5