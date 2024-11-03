playsound note.bassattack @initiator[hasitem={item=flowering_azalea,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=flowering_azalea,quantity=..0}] §cYou can't sell a Flowering Azalea!

playsound random.levelup @initiator[hasitem={item=flowering_azalea,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=flowering_azalea,quantity=1..}] §aYou can sell a Flowering Azalea!

scoreboard players add @initiator[hasitem={item=flowering_azalea,quantity=1..}] Moneyz 5

tell @initiator[hasitem={item=flowering_azalea,quantity=1..}] §aSold a Flowering Azalea!

clear @initiator[hasitem={item=flowering_azalea,quantity=1..}] flowering_azalea 0 1