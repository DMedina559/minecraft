playsound note.bassattack @initiator[hasitem={item=golden_pickaxe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=golden_pickaxe,quantity=..0}] §cYou can't sell a Gold Pickaxe!

playsound random.levelup @initiator[hasitem={item=golden_pickaxe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=golden_pickaxe,quantity=1..}] §aYou can sell a Gold Pickaxe!

scoreboard players add @initiator[hasitem={item=golden_pickaxe,quantity=1..}] Moneyz 200

tell @initiator[hasitem={item=golden_pickaxe,quantity=1..}] §aSold a Gold Pickaxe!

clear @initiator[hasitem={item=golden_pickaxe,quantity=1..}] golden_pickaxe -1 1