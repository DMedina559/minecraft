
playsound note.bassattack @initiator[hasitem={item=warped_plank,quantity=..19}] ~ ~ ~

tell @initiator[hasitem={item=warped_plank,quantity=..19}] §cYou can't sell 20 Warped Planks!

playsound random.levelup @initiator[hasitem={item=warped_plank,quantity=20..}] ~ ~ ~

tell @initiator[hasitem={item=warped_plank,quantity=20..}] §aYou can sell 20 Warped Planks!

scoreboard players add @initiator[hasitem={item=warped_plank,quantity=20..}] Moneyz 10

tell @initiator[hasitem={item=warped_plank,quantity=20..}] §aSold 20 Warped Planks!

clear @initiator[hasitem={item=warped_plank,quantity=20..}] warped_plank 0 20