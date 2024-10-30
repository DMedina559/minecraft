playsound note.bassattack @initiator[hasitem={item=bowl,quantity=..1}] ~ ~ ~

tell @initiator[hasitem={item=bowl,quantity=..1}] §cYou can't sell a Bowl!

playsound random.levelup @initiator[hasitem={item=bowl,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=bowl,quantity=1..}] §aYou can sell a Bowl!

scoreboard players add @initiator[hasitem={item=bowl,quantity=1..}] Moneyz 5

tell @initiator[hasitem={item=bowl,quantity=1..}] §aSold a Bowl!

clear @initiator[hasitem={item=bowl,quantity=1..}] bowl 0 1