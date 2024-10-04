tell @initiator[hasitem={item=cod,quantity=..4}] §cYou can't sell 5 Fish!

tell @initiator[hasitem={item=cod,quantity=5..}] §aYou can sell 5 Fish!

scoreboard players add @initiator[hasitem={item=cod,quantity=5..}] Moneyz 25

tell @initiator[hasitem={item=cod,quantity=5..}] §aSold 5 Fish!

clear @initiator[hasitem={item=cod,quantity=5..}] cod 0 5