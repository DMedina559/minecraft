playsound note.bassattack @initiator[hasitem={item=carrot,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=carrot,quantity=..9}] §cYou can't sell 10 Carrots!

playsound random.levelup @initiator[hasitem={item=carrot,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=carrot,quantity=10..}] §aYou can sell 10 Carrots!

scoreboard players add @initiator[hasitem={item=carrot,quantity=10..}] Moneyz 5

tell @initiator[hasitem={item=carrot,quantity=10..}] §aSold 10 Carrots!

clear @initiator[hasitem={item=carrot,quantity=10..}] carrot 0 10