playsound note.bassattack @initiator[hasitem={item=lantern,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=lantern,quantity=..9}] §cYou can't sell 10 Lanterns!

playsound random.levelup @initiator[hasitem={item=lantern,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=lantern,quantity=10..}] §aYou can sell 10 Lanterns!

scoreboard players add @initiator[hasitem={item=lantern,quantity=10..}] Moneyz 55

tell @initiator[hasitem={item=lantern,quantity=10..}] §aSold 10 Lanterns!

clear @initiator[hasitem={item=lantern,quantity=10..}] lantern  10
