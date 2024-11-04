playsound note.bassattack @initiator[hasitem={item=cobblestone,quantity=..19}] ~ ~ ~

tell @initiator[hasitem={item=cobblestone,quantity=..19}] §cYou can't sell 20 Cobblestone!

playsound random.levelup @initiator[hasitem={item=cobblestone,quantity=20..}] ~ ~ ~

tell @initiator[hasitem={item=cobblestone,quantity=20..}] §aYou can sell 20 Cobblestone!

scoreboard players add @initiator[hasitem={item=cobblestone,quantity=20..}] Moneyz 10

tell @initiator[hasitem={item=cobblestone,quantity=20..}] §aSold 20 Cobblestone!

clear @initiator[hasitem={item=cobblestone,quantity=20..}] cobblestone 0 20