playsound note.bassattack @initiator[hasitem={item=golden_hoe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=golden_hoe,quantity=..0}] §cYou can't sell a Gold Hoe!

playsound random.levelup @initiator[hasitem={item=golden_hoe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=golden_hoe,quantity=1..}] §aYou can sell a Gold Hoe!

scoreboard players add @initiator[hasitem={item=golden_hoe,quantity=1..}] Moneyz 200

tell @initiator[hasitem={item=golden_hoe,quantity=1..}] §aSold a Gold Hoe!

clear @initiator[hasitem={item=golden_hoe,quantity=1..}] golden_hoe -1 1