playsound note.bassattack @initiator[hasitem={item=shield,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=shield,quantity=..0}] §cYou can't sell a Shield!

playsound random.levelup @initiator[hasitem={item=shield,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=shield,quantity=1..}] §aYou can sell a Shield!

scoreboard players add @initiator[hasitem={item=shield,quantity=1..}] Moneyz 100

tell @initiator[hasitem={item=shield,quantity=1..}] §aSold a Shield!

clear @initiator[hasitem={item=shield,quantity=1..}] shield -1 1