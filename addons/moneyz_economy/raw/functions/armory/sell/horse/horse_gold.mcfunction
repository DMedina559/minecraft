playsound note.bassattack @initiator[hasitem={item=golden_horse_armor,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=golden_horse_armor,quantity=..0}] §cYou can't sell a Gold Horse Armor!

playsound random.levelup @initiator[hasitem={item=golden_horse_armor,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=golden_horse_armor,quantity=1..}] §aYou can sell a Gold Horse Armor!

scoreboard players add @initiator[hasitem={item=golden_horse_armor,quantity=1..}] Moneyz 100

tell @initiator[hasitem={item=golden_horse_armor,quantity=1..}] §aSold a Gold Horse Armor!

clear @initiator[hasitem={item=golden_horse_armor,quantity=1..}] golden_horse_armor -1 1