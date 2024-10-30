playsound note.bassattack @initiator[hasitem={item=netherite_pickaxe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=netherite_pickaxe,quantity=..0}] §cYou can't sell a Netherite Pickaxe!

playsound random.levelup @initiator[hasitem={item=netherite_pickaxe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=netherite_pickaxe,quantity=1..}] §aYou can sell a Netherite Pickaxe!

scoreboard players add @initiator[hasitem={item=netherite_pickaxe,quantity=1..}] Moneyz 1000

tell @initiator[hasitem={item=netherite_pickaxe,quantity=1..}] §aSold a Netherite Pickaxe!

clear @initiator[hasitem={item=netherite_pickaxe,quantity=1..}] netherite_pickaxe -1 1