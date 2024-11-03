playsound note.bassattack @initiator[hasitem={item=red_tulip,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=red_tulip,quantity=..4}] §cYou can't sell 5 Red Tulips!

playsound random.levelup @initiator[hasitem={item=red_tulip,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=red_tulip,quantity=5..}] §aYou can sell 5 Red Tulips!

scoreboard players add @initiator[hasitem={item=red_tulip,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=red_tulip,quantity=5..}] §aSold 5 Red Tulips!

clear @initiator[hasitem={item=red_tulip,quantity=5..}] red_tulip 0 5