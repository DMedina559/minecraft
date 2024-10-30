playsound note.bassattack @initiator[hasitem={item=fishing_rod,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=fishing_rod,quantity=..0}] §cYou can't sell a Fishing Rod!

playsound random.levelup @initiator[hasitem={item=fishing_rod,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=fishing_rod,quantity=1..}] §aYou can sell a Fishing Rod!

scoreboard players add @initiator[hasitem={item=fishing_rod,quantity=1..}] Moneyz 50

tell @initiator[hasitem={item=fishing_rod,quantity=1..}] §aSold a Fishing Rod!

clear @initiator[hasitem={item=fishing_rod,quantity=1..}] fishing_rod -1 1