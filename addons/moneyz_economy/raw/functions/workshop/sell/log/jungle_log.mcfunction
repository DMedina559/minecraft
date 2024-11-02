playsound note.bassattack @initiator[hasitem={item=jungle_log,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=jungle_log,quantity=..4}] §cYou can't sell 5 Jungle Logs!

playsound random.levelup @initiator[hasitem={item=jungle_log,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=jungle_log,quantity=5..}] §aYou can sell 5 Jungle Logs!

scoreboard players add @initiator[hasitem={item=jungle_log,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=jungle_log,quantity=5..}] §aSold 5 Jungle Logs!

clear @initiator[hasitem={item=jungle_log,quantity=5..}] jungle_log 0 5