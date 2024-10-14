playsound note.bassattack @initiator[hasitem={item=stone_axe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=stone_axe,quantity=..0}] §cYou can't sell a Stone Axe!

playsound random.levelup @initiator[hasitem={item=stone_axe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=stone_axe,quantity=1..}] §aYou can sell a Stone Axe!

scoreboard players add @initiator[hasitem={item=stone_axe,quantity=1..}] Moneyz 300

tell @initiator[hasitem={item=stone_axe,quantity=1..}] §aSold a Stone Axe!

clear @initiator[hasitem={item=stone_axe,quantity=1..}] stone_axe 0 1