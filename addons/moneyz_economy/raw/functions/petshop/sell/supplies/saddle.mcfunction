playsound note.bassattack @initiator[hasitem={item=saddle,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=saddle,quantity=..0}] §cYou can't sell a Saddle!

playsound random.levelup @initiator[hasitem={item=saddle,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=saddle,quantity=1..}] §aYou can sell a Saddle!

scoreboard players add @initiator[hasitem={item=saddle,quantity=1..}] Moneyz 30

tell @initiator[hasitem={item=saddle,quantity=1..}] §aSold a Saddle!

clear @initiator[hasitem={item=saddle,quantity=1..}] saddle 0 1