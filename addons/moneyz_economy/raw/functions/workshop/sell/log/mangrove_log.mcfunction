playsound note.bassattack @initiator[hasitem={item=mangrove_log,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=mangrove_log,quantity=..4}] §cYou can't sell 5 Mangrove Logs!

playsound random.levelup @initiator[hasitem={item=mangrove_log,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=mangrove_log,quantity=5..}] §aYou can sell 5 Mangrove Logs!

scoreboard players add @initiator[hasitem={item=mangrove_log,quantity=5..}] Moneyz 15

tell @initiator[hasitem={item=mangrove_log,quantity=5..}] §aSold 5 Mangrove Logs!

clear @initiator[hasitem={item=mangrove_log,quantity=5..}] mangrove_log 0 5