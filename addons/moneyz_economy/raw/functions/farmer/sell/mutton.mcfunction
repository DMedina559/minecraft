playsound note.bassattack @initiator[hasitem={item=mutton,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=mutton,quantity=..4}] §cYou can't sell 5 Raw Mutton!

playsound random.levelup @initiator[hasitem={item=mutton,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=mutton,quantity=5..}] §aYou can sell 5 Raw Mutton!

scoreboard players add @initiator[hasitem={item=mutton,quantity=5..}] Moneyz 25

tell @initiator[hasitem={item=mutton,quantity=5..}] §aSold 5 Raw Mutton!

clear @initiator[hasitem={item=mutton,quantity=5..}] mutton 0 5