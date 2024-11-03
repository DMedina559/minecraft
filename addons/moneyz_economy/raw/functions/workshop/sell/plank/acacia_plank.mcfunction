playsound note.bassattack @initiator[hasitem={item=acacia_plank,quantity=..19}] ~ ~ ~

tell @initiator[hasitem={item=acacia_plank,quantity=..19}] §cYou can't sell 20 Acacia Planks!

playsound random.levelup @initiator[hasitem={item=acacia_plank,quantity=20..}] ~ ~ ~

tell @initiator[hasitem={item=acacia_plank,quantity=20..}] §aYou can sell 20 Acacia Planks!

scoreboard players add @initiator[hasitem={item=acacia_plank,quantity=20..}] Moneyz 5

tell @initiator[hasitem={item=acacia_plank,quantity=20..}] §aSold 20 Acacia Planks!

clear @initiator[hasitem={item=acacia_plank,quantity=20..}] acacia_plank 0 20