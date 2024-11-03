playsound note.bassattack @initiator[hasitem={item=pink_tulip,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=pink_tulip,quantity=..4}] §cYou can't sell 5 Pink Tulips!

playsound random.levelup @initiator[hasitem={item=pink_tulip,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=pink_tulip,quantity=5..}] §aYou can sell 5 Pink Tulips!

scoreboard players add @initiator[hasitem={item=pink_tulip,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=pink_tulip,quantity=5..}] §aSold 5 Pink Tulips!

clear @initiator[hasitem={item=pink_tulip,quantity=5..}] pink_tulip 0 5