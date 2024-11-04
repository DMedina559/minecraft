playsound note.bassattack @initiator[hasitem={item=diorite,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=diorite,quantity=..4}] §cYou can't sell 5 Diorite!

playsound random.levelup @initiator[hasitem={item=diorite,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=diorite,quantity=5..}] §aYou can sell 5 Diorite!

scoreboard players add @initiator[hasitem={item=diorite,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=diorite,quantity=5..}] §aSold 5 Diorite!

clear @initiator[hasitem={item=diorite,quantity=5..}] diorite 0 5