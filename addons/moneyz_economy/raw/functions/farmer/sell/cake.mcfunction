tell @initiator[hasitem={item=cake,quantity=..0}] §cYou can't sell a Cake!

tell @initiator[hasitem={item=cake,quantity=1..}] §aYou can sell a Cake!

scoreboard players add @initiator[hasitem={item=cake,quantity=1..}] Moneyz 15

tell @initiator[hasitem={item=cake,quantity=1..}] §aSold a Cake!

clear @initiator[hasitem={item=cake,quantity=1..}] cake 0 1