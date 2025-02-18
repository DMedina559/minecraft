playsound note.bassattack @initiator[hasitem={item=end_rod,quantity=..14}] ~ ~ ~

tell @initiator[hasitem={item=end_rod,quantity=..14}] §cYou can't sell 15 End Rods!

playsound random.levelup @initiator[hasitem={item=end_rod,quantity=15..}] ~ ~ ~

tell @initiator[hasitem={item=end_rod,quantity=15..}] §aYou can sell 15 End Rods!

scoreboard players add @initiator[hasitem={item=end_rod,quantity=15..}] Moneyz 125

tell @initiator[hasitem={item=end_rod,quantity=15..}] §aSold 15 End Rods!

clear @initiator[hasitem={item=end_rod,quantity=15..}] end_rod  15
