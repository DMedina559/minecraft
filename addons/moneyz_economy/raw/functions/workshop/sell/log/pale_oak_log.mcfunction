playsound note.bassattack @initiator[hasitem={item=pale_oak_log,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=pale_oak_log,quantity=..4}] §cYou can't sell 5 Pale Oak Logs!

playsound random.levelup @initiator[hasitem={item=pale_oak_log,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=pale_oak_log,quantity=5..}] §aYou can sell 5 Pale Oak Logs!

scoreboard players add @initiator[hasitem={item=pale_oak_log,quantity=5..}] Moneyz 15

tell @initiator[hasitem={item=pale_oak_log,quantity=5..}] §aSold 5 Pale Oak Logs!

clear @initiator[hasitem={item=pale_oak_log,quantity=5..}] pale_oak_log 0 5