playsound note.bassattack @initiator[hasitem={item=conduit,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=conduit,quantity=..0}] §cYou can't sell a Conduit!

playsound random.levelup @initiator[hasitem={item=conduit,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=conduit,quantity=1..}] §aYou can sell a Conduit!

scoreboard players add @initiator[hasitem={item=conduit,quantity=1..}] Moneyz 50

tell @initiator[hasitem={item=conduit,quantity=1..}] §aSold a Conduit!

clear @initiator[hasitem={item=conduit,quantity=1..}] conduit 0 1