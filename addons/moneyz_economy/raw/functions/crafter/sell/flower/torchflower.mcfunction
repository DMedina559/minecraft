playsound note.bassattack @initiator[hasitem={item=torchflower,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=torchflower,quantity=..0}] §cYou can't sell a Torchflower!

playsound random.levelup @initiator[hasitem={item=torchflower,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=torchflower,quantity=1..}] §aYou can sell a Torchflower!

scoreboard players add @initiator[hasitem={item=torchflower,quantity=1..}] Moneyz 40

tell @initiator[hasitem={item=torchflower,quantity=1..}] §aSold a Torchflower!

clear @initiator[hasitem={item=torchflower,quantity=1..}] torchflower 0 1