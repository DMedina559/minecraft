playsound note.bassattack @initiator[hasitem={item=golden_shovel,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=golden_shovel,quantity=..0}] §cYou can't sell a Gold Shovel!

playsound random.levelup @initiator[hasitem={item=golden_shovel,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=golden_shovel,quantity=1..}] §aYou can sell a Gold Shovel!

scoreboard players add @initiator[hasitem={item=golden_shovel,quantity=1..}] Moneyz 300

tell @initiator[hasitem={item=golden_shovel,quantity=1..}] §aSold a Gold Shovel!

clear @initiator[hasitem={item=golden_shovel,quantity=1..}] golden_shovel -1 1