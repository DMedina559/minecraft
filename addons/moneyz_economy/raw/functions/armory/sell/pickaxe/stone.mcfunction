playsound note.bassattack @initiator[hasitem={item=stone_pickaxe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=stone_pickaxe,quantity=..0}] §cYou can't sell a Stone Pickaxe!

playsound random.levelup @initiator[hasitem={item=stone_pickaxe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=stone_pickaxe,quantity=1..}] §aYou can sell a Stone Pickaxe!

scoreboard players add @initiator[hasitem={item=stone_pickaxe,quantity=1..}] Moneyz 100

tell @initiator[hasitem={item=stone_pickaxe,quantity=1..}] §aSold a Stone Pickaxe!

clear @initiator[hasitem={item=stone_pickaxe,quantity=1..}] stone_pickaxe -1 1