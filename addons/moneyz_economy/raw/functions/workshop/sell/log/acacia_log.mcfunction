playsound note.bassattack @initiator[hasitem={item=acacia_log,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=acacia_log,quantity=..4}] §cYou can't sell 5 Acacia Logs!

playsound random.levelup @initiator[hasitem={item=acacia_log,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=acacia_log,quantity=5..}] §aYou can sell 5 Acacia Logs!

scoreboard players add @initiator[hasitem={item=acacia_log,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=acacia_log,quantity=5..}] §aSold 5 Acacia Logs!

clear @initiator[hasitem={item=acacia_log,quantity=5..}] acacia_log 0 5