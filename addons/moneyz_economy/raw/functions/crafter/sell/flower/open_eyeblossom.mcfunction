playsound note.bassattack @initiator[hasitem={item=open_eyeblossom,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=open_eyeblossom,quantity=..0}] §cYou can't sell a Open Eyeblossoms!

playsound random.levelup @initiator[hasitem={item=open_eyeblossom,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=open_eyeblossom,quantity=1..}] §aYou can sell a Open Eyeblossoms!

scoreboard players add @initiator[hasitem={item=open_eyeblossom,quantity=1..}] Moneyz 10

tell @initiator[hasitem={item=open_eyeblossom,quantity=1..}] §aSold a Open Eyeblossoms!

clear @initiator[hasitem={item=open_eyeblossom,quantity=1..}] open_eyeblossom 0 1