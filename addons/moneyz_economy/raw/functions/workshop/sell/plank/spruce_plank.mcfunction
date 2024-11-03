playsound note.bassattack @initiator[hasitem={item=spruce_plank,quantity=..19}] ~ ~ ~

tell @initiator[hasitem={item=spruce_plank,quantity=..19}] §cYou can't sell 20 Spruce Planks!

playsound random.levelup @initiator[hasitem={item=spruce_plank,quantity=20..}] ~ ~ ~

tell @initiator[hasitem={item=spruce_plank,quantity=20..}] §aYou can sell 20 Spruce Planks!

scoreboard players add @initiator[hasitem={item=spruce_plank,quantity=20..}] Moneyz 5

tell @initiator[hasitem={item=spruce_plank,quantity=20..}] §aSold 20 Spruce Planks!

clear @initiator[hasitem={item=spruce_plank,quantity=20..}] spruce_plank 0 20