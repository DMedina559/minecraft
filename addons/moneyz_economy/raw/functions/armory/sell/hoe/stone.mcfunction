playsound note.bassattack @initiator[hasitem={item=stone_hoe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=stone_hoe,quantity=..0}] §cYou can't sell a Stone Hoe!

playsound random.levelup @initiator[hasitem={item=stone_hoe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=stone_hoe,quantity=1..}] §aYou can sell a Stone Hoe!

scoreboard players add @initiator[hasitem={item=stone_hoe,quantity=1..}] Moneyz 100

tell @initiator[hasitem={item=stone_hoe,quantity=1..}] §aSold a Stone Hoe!

clear @initiator[hasitem={item=stone_hoe,quantity=1..}] stone_hoe -1 1