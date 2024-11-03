playsound note.bassattack @initiator[hasitem={item=jungle_plank,quantity=..19}] ~ ~ ~

tell @initiator[hasitem={item=jungle_plank,quantity=..19}] §cYou can't sell 20 Jungle Planks!

playsound random.levelup @initiator[hasitem={item=jungle_plank,quantity=20..}] ~ ~ ~

tell @initiator[hasitem={item=jungle_plank,quantity=20..}] §aYou can sell 20 Jungle Planks!

scoreboard players add @initiator[hasitem={item=jungle_plank,quantity=20..}] Moneyz 5

tell @initiator[hasitem={item=jungle_plank,quantity=20..}] §aSold 20 Jungle Planks!

clear @initiator[hasitem={item=jungle_plank,quantity=20..}] jungle_plank 0 20