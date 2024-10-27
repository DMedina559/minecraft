playsound note.bassattack @initiator[hasitem={item=bundle,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=bundle,quantity=..0}] §cYou can't sell a Bundle!

playsound random.levelup @initiator[hasitem={item=bundle,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=bundle,quantity=1..}] §aYou can sell a Bundle!

scoreboard players add @initiator[hasitem={item=bundle,quantity=1..}] Moneyz 5

tell @initiator[hasitem={item=bundle,quantity=1..}] §aSold 1 Bundle!

clear @initiator[hasitem={item=bundle,quantity=1..}] bundle 0 1