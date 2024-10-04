tell @initiator[hasitem={item=cod,quantity=..4}] §cYou can't sell 5 Raw COD!

tell @initiator[hasitem={item=cod,quantity=5..}] §aYou can sell 5 Raw COD!

scoreboard players add @initiator[hasitem={item=cod,quantity=5..}] Moneyz 15

tell @initiator[hasitem={item=cod,quantity=5..}] §aSold 5 Raw COD!

clear @initiator[hasitem={item=cod,quantity=5..}] cod 0 5