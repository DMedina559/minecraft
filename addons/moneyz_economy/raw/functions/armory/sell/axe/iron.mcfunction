playsound note.bassattack @initiator[hasitem={item=iron_axe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=iron_axe,quantity=..0}] §cYou can't sell a Iron Axe!

playsound random.levelup @initiator[hasitem={item=iron_axe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=iron_axe,quantity=1..}] §aYou can sell a Iron Axe!

scoreboard players add @initiator[hasitem={item=iron_axe,quantity=1..}] Moneyz 500

tell @initiator[hasitem={item=iron_axe,quantity=1..}] §aSold a Iron Axe!

clear @initiator[hasitem={item=iron_axe,quantity=1..}] iron_axe -1 1