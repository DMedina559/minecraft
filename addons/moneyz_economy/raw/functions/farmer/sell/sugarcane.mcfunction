tell @initiator[hasitem={item=sugar_cane,quantity=..9}] §cYou can't sell 10 Sugar Canes!

tell @initiator[hasitem={item=sugar_cane,quantity=10..}] §aYou can sell 10 Sugar Canes!

scoreboard players add @initiator[hasitem={item=sugar_cane,quantity=10..}] Moneyz 15

tell @initiator[hasitem={item=sugar_cane,quantity=10..}] §aSold 10 Sugar Canes!

clear @initiator[hasitem={item=sugar_cane,quantity=10..}] sugar_cane 0 10