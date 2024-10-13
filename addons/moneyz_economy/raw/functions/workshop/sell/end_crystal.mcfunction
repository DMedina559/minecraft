playsound note.bassattack @initiator[hasitem={item=end_crystal,quantity=..3}] ~ ~ ~

tell @initiator[hasitem={item=end_crystal,quantity=..3}] §cYou can't sell 4 End Crystals!

playsound random.levelup @initiator[hasitem={item=end_crystal,quantity=4..}] ~ ~ ~

tell @initiator[hasitem={item=end_crystal,quantity=4..}] §aYou can sell 4 End Crystals!

scoreboard players add @initiator[hasitem={item=end_crystal,quantity=4..}] Moneyz 1000

tell @initiator[hasitem={item=end_crystal,quantity=4..}] §aSold 4 End Crystals!

clear @initiator[hasitem={item=end_crystal,quantity=4..}] end_crystal 0 4