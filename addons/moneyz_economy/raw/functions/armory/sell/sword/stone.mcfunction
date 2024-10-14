playsound note.bassattack @initiator[hasitem={item=stone_sword,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=stone_sword,quantity=..0}] §cYou can't sell a Stone Sword!

playsound random.levelup @initiator[hasitem={item=stone_sword,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=stone_sword,quantity=1..}] §aYou can sell a Stone Sword!

scoreboard players add @initiator[hasitem={item=stone_sword,quantity=1..}] Moneyz 200

tell @initiator[hasitem={item=stone_sword,quantity=1..}] §aSold a Stone Sword!

clear @initiator[hasitem={item=stone_sword,quantity=1..}] stone_sword 0 1