playsound note.bassattack @initiator[hasitem={item=lily_of_the_valley,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=lily_of_the_valley,quantity=..4}] §cYou can't sell 5 Lily of the Valleys!

playsound random.levelup @initiator[hasitem={item=lily_of_the_valley,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=lily_of_the_valley,quantity=5..}] §aYou can sell 5 Lily of the Valleys!

scoreboard players add @initiator[hasitem={item=lily_of_the_valley,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=lily_of_the_valley,quantity=5..}] §aSold 5 Lily of the Valleys!

clear @initiator[hasitem={item=lily_of_the_valley,quantity=5..}] lily_of_the_valley 0 5