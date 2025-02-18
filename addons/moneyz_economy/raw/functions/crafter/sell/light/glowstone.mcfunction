playsound note.bassattack @initiator[hasitem={item=glowstone,quantity=..19}] ~ ~ ~

tell @initiator[hasitem={item=glowstone,quantity=..19}] §cYou can't sell 20 Glowstones!

playsound random.levelup @initiator[hasitem={item=glowstone,quantity=20..}] ~ ~ ~

tell @initiator[hasitem={item=glowstone,quantity=20..}] §aYou can sell 20 Glowstones!

scoreboard players add @initiator[hasitem={item=glowstone,quantity=20..}] Moneyz 30

tell @initiator[hasitem={item=glowstone,quantity=20..}] §aSold 20 Glowstones!

clear @initiator[hasitem={item=glowstone,quantity=20..}] glowstone  20
