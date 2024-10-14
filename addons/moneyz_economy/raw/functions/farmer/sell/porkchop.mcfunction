playsound note.bassattack @initiator[hasitem={item=porkchop,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=porkchop,quantity=..4}] §cYou can't sell 5 Raw Porkchops!

playsound random.levelup @initiator[hasitem={item=porkchop,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=porkchop,quantity=5..}] §aYou can sell 5 Raw Porkchops!

scoreboard players add @initiator[hasitem={item=porkchop,quantity=5..}] Moneyz 15

tell @initiator[hasitem={item=porkchop,quantity=5..}] §aSold 5 Raw Porkchops!

clear @initiator[hasitem={item=porkchop,quantity=5..}] porkchop 0 5