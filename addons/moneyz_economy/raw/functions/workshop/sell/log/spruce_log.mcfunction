playsound note.bassattack @initiator[hasitem={item=spruce_log,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=spruce_log,quantity=..4}] §cYou can't sell 5 Spruce Logs!

playsound random.levelup @initiator[hasitem={item=spruce_log,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=spruce_log,quantity=5..}] §aYou can sell 5 Spruce Logs!

scoreboard players add @initiator[hasitem={item=spruce_log,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=spruce_log,quantity=5..}] §aSold 5 Spruce Logs!

clear @initiator[hasitem={item=spruce_log,quantity=5..}] spruce_log 0 5