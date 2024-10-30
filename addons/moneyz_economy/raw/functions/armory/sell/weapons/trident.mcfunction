playsound note.bassattack @initiator[hasitem={item=trident,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=trident,quantity=..0}] §cYou can't sell a Trident!

playsound random.levelup @initiator[hasitem={item=trident,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=trident,quantity=1..}] §aYou can sell a Trident!

scoreboard players add @initiator[hasitem={item=trident,quantity=1..}] Moneyz 100

tell @initiator[hasitem={item=trident,quantity=1..}] §aSold a Trident!

clear @initiator[hasitem={item=trident,quantity=1..}] trident -1 1