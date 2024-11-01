playsound note.bassattack @initiator[hasitem={item=cactus,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=cactus,quantity=..4}] §cYou can't sell 5 Cacti!

playsound random.levelup @initiator[hasitem={item=cactus,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=cactus,quantity=5..}] §aYou can sell 5 Cacti!

scoreboard players add @initiator[hasitem={item=cactus,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=cactus,quantity=5..}] §aSold 5 Cacti!

clear @initiator[hasitem={item=cactus,quantity=5..}] cactus 0 5