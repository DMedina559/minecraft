playsound note.bassattack @initiator[hasitem={item=diamond_shovel,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=diamond_shovel,quantity=..0}] §cYou can't sell a Diamond Shovel!

playsound random.levelup @initiator[hasitem={item=diamond_shovel,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=diamond_shovel,quantity=1..}] §aYou can sell a Diamond Shovel!

scoreboard players add @initiator[hasitem={item=diamond_shovel,quantity=1..}] Moneyz 500

tell @initiator[hasitem={item=diamond_shovel,quantity=1..}] §aSold a Diamond Shovel!

clear @initiator[hasitem={item=diamond_shovel,quantity=1..}] diamond_shovel -1 1