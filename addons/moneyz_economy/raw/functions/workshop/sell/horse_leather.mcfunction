tell @initiator[hasitem={item=leather_horse_armor,quantity=..0}] §cYou can't sell a Leather Horse Armor!

tell @initiator[hasitem={item=leather_horse_armor,quantity=1..}] §aYou can sell a Leather Horse Armor!

scoreboard players add @initiator[hasitem={item=leather_horse_armor,quantity=1..}] Moneyz 50

tell @initiator[hasitem={item=leather_horse_armor,quantity=1..}] §aSold a Leather Horse Armor!

clear @initiator[hasitem={item=leather_horse_armor,quantity=1..}] leather_horse_armor 0 1