tell @initiator[hasitem={item=bone,quantity=..4}] §cYou can't sell 5 Bones!

tell @initiator[hasitem={item=bone,quantity=5..}] §aYou can sell 5 Bones!

scoreboard players add @initiator[hasitem={item=bone,quantity=5..}] Moneyz 25

tell @initiator[hasitem={item=bone,quantity=5..}] §aSold 5 Bones!

clear @initiator[hasitem={item=bone,quantity=5..}] bone 0 5