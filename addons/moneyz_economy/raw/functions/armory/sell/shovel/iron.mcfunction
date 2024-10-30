playsound note.bassattack @initiator[hasitem={item=iron_shovel,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=iron_shovel,quantity=..0}] §cYou can't sell a Iron Shovel!

playsound random.levelup @initiator[hasitem={item=iron_shovel,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=iron_shovel,quantity=1..}] §aYou can sell a Iron Shovel!

scoreboard players add @initiator[hasitem={item=iron_shovel,quantity=1..}] Moneyz 400

tell @initiator[hasitem={item=iron_shovel,quantity=1..}] §aSold a Iron Shovel!

clear @initiator[hasitem={item=iron_shovel,quantity=1..}] iron_shovel -1 1