playsound note.bassattack @initiator[hasitem={item=netherite_axe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=netherite_axe,quantity=..0}] §cYou can't sell a Netherite Axe!

playsound random.levelup @initiator[hasitem={item=netherite_axe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=netherite_axe,quantity=1..}] §aYou can sell a Netherite Axe!

scoreboard players add @initiator[hasitem={item=netherite_axe,quantity=1..}] Moneyz 700

tell @initiator[hasitem={item=netherite_axe,quantity=1..}] §aSold a Netherite Axe!

clear @initiator[hasitem={item=netherite_axe,quantity=1..}] netherite_axe -1 1