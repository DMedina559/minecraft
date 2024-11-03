playsound note.bassattack @initiator[hasitem={item=dandelion,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=dandelion,quantity=..4}] §cYou can't sell 5 Dandelions!

playsound random.levelup @initiator[hasitem={item=dandelion,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=dandelion,quantity=5..}] §aYou can sell 5 Dandelions!

scoreboard players add @initiator[hasitem={item=dandelion,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=dandelion,quantity=5..}] §aSold 5 Dandelions!

clear @initiator[hasitem={item=dandelion,quantity=5..}] dandelion 0 5