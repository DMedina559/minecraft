tell @initiator[hasitem={item=diamond_horse_armor,quantity=..0}] §cYou can't sell a Diamond Horse Armor!

tell @initiator[hasitem={item=diamond_horse_armor,quantity=1..}] §aYou can sell a Diamond Horse Armor!

scoreboard players add @initiator[hasitem={item=diamond_horse_armor,quantity=1..}] Moneyz 250

tell @initiator[hasitem={item=diamond_horse_armor,quantity=1..}] §aSold a Diamond Horse Armor!

clear @initiator[hasitem={item=diamond_horse_armor,quantity=1..}] diamond_horse_armor 0 1