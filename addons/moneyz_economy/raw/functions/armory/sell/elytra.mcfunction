playsound note.bassattack @initiator[hasitem={item=elytra,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=elytra,quantity=..0}] §cYou can't sell an Elytra!

playsound random.levelup @initiator[hasitem={item=elytra,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=elytra,quantity=1..}] §aYou can sell an Elytra!

scoreboard players add @initiator[hasitem={item=elytra,quantity=1..}] Moneyz 1000

tell @initiator[hasitem={item=elytra,quantity=1..}] §aSold an Elytra!

clear @initiator[hasitem={item=elytra,quantity=1..}] elytra 0 1