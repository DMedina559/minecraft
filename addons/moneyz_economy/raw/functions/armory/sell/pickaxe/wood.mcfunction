playsound note.bassattack @initiator[hasitem={item=wooden_pickaxe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=wooden_pickaxe,quantity=..0}] §cYou can't sell a Wood Pickaxe!

playsound random.levelup @initiator[hasitem={item=wooden_pickaxe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=wooden_pickaxe,quantity=1..}] §aYou can sell a Wood Pickaxe!

scoreboard players add @initiator[hasitem={item=wooden_pickaxe,quantity=1..}] Moneyz 50

tell @initiator[hasitem={item=wooden_pickaxe,quantity=1..}] §aSold a Wood Pickaxe!

clear @initiator[hasitem={item=wooden_pickaxe,quantity=1..}] wooden_pickaxe -1 1