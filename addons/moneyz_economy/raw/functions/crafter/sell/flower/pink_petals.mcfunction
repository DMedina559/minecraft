playsound note.bassattack @initiator[hasitem={item=pink_petals,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=pink_petals,quantity=..9}] §cYou can't sell 10 Pink Petals!

playsound random.levelup @initiator[hasitem={item=pink_petals,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=pink_petals,quantity=10..}] §aYou can sell 10 Pink Petals!

scoreboard players add @initiator[hasitem={item=pink_petals,quantity=10..}] Moneyz 10

tell @initiator[hasitem={item=pink_petals,quantity=10..}] §aSold 10 Pink Petals!

clear @initiator[hasitem={item=pink_petals,quantity=10..}] pink_petals 0 10