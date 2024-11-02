playsound note.bassattack @initiator[hasitem={item=dark_oak_log,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=dark_oak_log,quantity=..4}] §cYou can't sell 5 Dark Oak Logs!

playsound random.levelup @initiator[hasitem={item=dark_oak_log,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=dark_oak_log,quantity=5..}] §aYou can sell 5 Dark Oak Logs!

scoreboard players add @initiator[hasitem={item=dark_oak_log,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=dark_oak_log,quantity=5..}] §aSold 5 Dark Oak Logs!

clear @initiator[hasitem={item=dark_oak_log,quantity=5..}] dark_oak_log 0 5