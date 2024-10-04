tell @initiator[hasitem={item=book,quantity=..4}] §cYou can't sell 5 Books!

tell @initiator[hasitem={item=book,quantity=5..}] §aYou can sell 5 Books!

scoreboard players add @initiator[hasitem={item=book,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=book,quantity=5..}] §aSold 5 Books!

clear @initiator[hasitem={item=book,quantity=5..}] book 0 5