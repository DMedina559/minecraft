playsound note.bassattack @initiator[hasitem={item=soul_lantern,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=soul_lantern,quantity=..9}] §cYou can't sell 10 Soul Lanterns!

playsound random.levelup @initiator[hasitem={item=soul_lantern,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=soul_lantern,quantity=10..}] §aYou can sell 10 Soul Lanterns!

scoreboard players add @initiator[hasitem={item=soul_lantern,quantity=10..}] Moneyz 45

tell @initiator[hasitem={item=soul_lantern,quantity=10..}] §aSold 10 Soul Lanterns!

clear @initiator[hasitem={item=soul_lantern,quantity=10..}] soul_lantern  10
