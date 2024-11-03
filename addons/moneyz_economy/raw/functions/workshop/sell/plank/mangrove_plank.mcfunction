playsound note.bassattack @initiator[hasitem={item=mangrove_plank,quantity=..19}] ~ ~ ~

tell @initiator[hasitem={item=mangrove_plank,quantity=..19}] §cYou can't sell 20 Mangrove Planks!

playsound random.levelup @initiator[hasitem={item=mangrove_plank,quantity=20..}] ~ ~ ~

tell @initiator[hasitem={item=mangrove_plank,quantity=20..}] §aYou can sell 20 Mangrove Planks!

scoreboard players add @initiator[hasitem={item=mangrove_plank,quantity=20..}] Moneyz 10

tell @initiator[hasitem={item=mangrove_plank,quantity=20..}] §aSold 20 Mangrove Planks!

clear @initiator[hasitem={item=mangrove_plank,quantity=20..}] mangrove_plank 0 20