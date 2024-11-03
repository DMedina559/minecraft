playsound note.bassattack @initiator[hasitem={item=white_tulip,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=white_tulip,quantity=..4}] §cYou can't sell 5 White Tulips!

playsound random.levelup @initiator[hasitem={item=white_tulip,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=white_tulip,quantity=5..}] §aYou can sell 5 White Tulips!

scoreboard players add @initiator[hasitem={item=white_tulip,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=white_tulip,quantity=5..}] §aSold 5 White Tulips!

clear @initiator[hasitem={item=white_tulip,quantity=5..}] white_tulip 0 5