playsound note.bassattack @initiator[hasitem={item=stone_shovel,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=stone_shovel,quantity=..0}] §cYou can't sell a Stone Shovel!

playsound random.levelup @initiator[hasitem={item=stone_shovel,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=stone_shovel,quantity=1..}] §aYou can sell a Stone Shovel!

scoreboard players add @initiator[hasitem={item=stone_shovel,quantity=1..}] Moneyz 200

tell @initiator[hasitem={item=stone_shovel,quantity=1..}] §aSold a Stone Shovel!

clear @initiator[hasitem={item=stone_shovel,quantity=1..}] stone_shovel -1 1