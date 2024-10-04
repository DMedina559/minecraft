tell @initiator[hasitem={item=lead,quantity=..0}] §cYou can't sell a Lead!

tell @initiator[hasitem={item=lead,quantity=1..}] §aYou can sell a Lead!

scoreboard players add @initiator[hasitem={item=lead,quantity=1..}] Moneyz 25

tell @initiator[hasitem={item=lead,quantity=1..}] §aSold a Lead!

clear @initiator[hasitem={item=lead,quantity=1..}] lead 0 1