playsound note.bassattack @initiator[hasitem={item=diamond_pickaxe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=diamond_pickaxe,quantity=..0}] §cYou can't sell a Diamond Pickaxe!

playsound random.levelup @initiator[hasitem={item=diamond_pickaxe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=diamond_pickaxe,quantity=1..}] §aYou can sell a Diamond Pickaxe!

scoreboard players add @initiator[hasitem={item=diamond_pickaxe,quantity=1..}] Moneyz 500

tell @initiator[hasitem={item=diamond_pickaxe,quantity=1..}] §aSold a Diamond Pickaxe!

clear @initiator[hasitem={item=diamond_pickaxe,quantity=1..}] diamond_pickaxe -1 1