tell @initiator[hasitem={item=potato,quantity=..9}] §cYou can't sell 10 Potatos!

tell @initiator[hasitem={item=potato,quantity=10..}] §aYou can sell 10 Potatos!

scoreboard players add @initiator[hasitem={item=potato,quantity=10..}] Moneyz 15

tell @initiator[hasitem={item=potato,quantity=10..}] §aSold 10 Potatos!

clear @initiator[hasitem={item=potato,quantity=10..}] potato 0 10