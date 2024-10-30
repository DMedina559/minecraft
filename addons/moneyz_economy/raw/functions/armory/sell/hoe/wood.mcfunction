playsound note.bassattack @initiator[hasitem={item=wooden_hoe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=wooden_hoe,quantity=..0}] §cYou can't sell a Wood Hoe!

playsound random.levelup @initiator[hasitem={item=wooden_hoe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=wooden_hoe,quantity=1..}] §aYou can sell a Wood Hoe!

scoreboard players add @initiator[hasitem={item=wooden_hoe,quantity=1..}] Moneyz 50

tell @initiator[hasitem={item=wooden_hoe,quantity=1..}] §aSold a Wood Hoe!

clear @initiator[hasitem={item=wooden_hoe,quantity=1..}] wooden_hoe -1 1