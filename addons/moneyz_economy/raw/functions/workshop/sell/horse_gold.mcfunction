tell @initiator[hasitem={item=gold_horse_armor,quantity=..0}] §cYou can't sell a Gold Horse Armor!

tell @initiator[hasitem={item=gold_horse_armor,quantity=1..}] §aYou can sell a Gold Horse Armor!

scoreboard players add @initiator[hasitem={item=gold_horse_armor,quantity=1..}] Moneyz 100

tell @initiator[hasitem={item=gold_horse_armor,quantity=1..}] §aSold a Gold Horse Armor!

clear @initiator[hasitem={item=gold_horse_armor,quantity=1..}] gold_horse_armor 0 1