playsound note.bassattack @initiator[hasitem={item=bamboo,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=bamboo,quantity=..4}] §cYou can't sell 5 Bamboos!

playsound random.levelup @initiator[hasitem={item=bamboo,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=bamboo,quantity=5..}] §aYou can sell 5 Bamboos!

scoreboard players add @initiator[hasitem={item=bamboo,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=bamboo,quantity=5..}] §aSold 5 Bamboos!

clear @initiator[hasitem={item=bamboo,quantity=5..}] bamboo 0 5