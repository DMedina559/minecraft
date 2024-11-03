playsound note.bassattack @initiator[hasitem={item=rose_bush,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=rose_bush,quantity=..4}] §cYou can't sell 5 Rose Bushes!

playsound random.levelup @initiator[hasitem={item=rose_bush,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=rose_bush,quantity=5..}] §aYou can sell 5 Rose Bushes!

scoreboard players add @initiator[hasitem={item=rose_bush,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=rose_bush,quantity=5..}] §aSold 5 Rose Bushes!

clear @initiator[hasitem={item=rose_bush,quantity=5..}] rose_bush 0 5