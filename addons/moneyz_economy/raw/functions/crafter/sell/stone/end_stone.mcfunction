playsound note.bassattack @initiator[hasitem={item=end_stone,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=end_stone,quantity=..9}] §cYou can't sell 20 End Stone!

playsound random.levelup @initiator[hasitem={item=end_stone,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=end_stone,quantity=10..}] §aYou can sell 20 End Stone!

scoreboard players add @initiator[hasitem={item=end_stone,quantity=10..}] Moneyz 20

tell @initiator[hasitem={item=end_stone,quantity=10..}] §aSold 20 End Stone!

clear @initiator[hasitem={item=end_stone,quantity=10..}] end_stone 0 10