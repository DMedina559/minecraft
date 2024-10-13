tell @initiator[hasitem={item=iron_horse_armor,quantity=..0}] §cYou can't sell a Iron Horse Armor!

tell @initiator[hasitem={item=iron_horse_armor,quantity=1..}] §aYou can sell a Iron Horse Armor!

scoreboard players add @initiator[hasitem={item=iron_horse_armor,quantity=1..}] Moneyz 150

tell @initiator[hasitem={item=iron_horse_armor,quantity=1..}] §aSold a Iron Horse Armor!

clear @initiator[hasitem={item=iron_horse_armor,quantity=1..}] iron_horse_armor 0 1