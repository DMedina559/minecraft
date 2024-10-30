playsound note.bassattack @initiator[hasitem={item=crossbow,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=crossbow,quantity=..0}] §cYou can't sell a Crossbow!

playsound random.levelup @initiator[hasitem={item=crossbow,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=crossbow,quantity=1..}] §aYou can sell a Crossbow!

scoreboard players add @initiator[hasitem={item=crossbow,quantity=1..}] Moneyz 100

tell @initiator[hasitem={item=crossbow,quantity=1..}] §aSold a Crossbow!

clear @initiator[hasitem={item=crossbow,quantity=1..}] crossbow -1 1