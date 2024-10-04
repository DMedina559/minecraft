tell @initiator[hasitem={item=pumpkin_pie,quantity=..0}] §cYou can't sell a Pumpkin Pie!

tell @initiator[hasitem={item=pumpkin_pie,quantity=1..}] §aYou can sell a Pumpkin Pie!

scoreboard players add @initiator[hasitem={item=pumpkin_pie,quantity=1..}] Moneyz 5

tell @initiator[hasitem={item=pumpkin_pie,quantity=1..}] §aSold a Pumpkin Pie!

clear @initiator[hasitem={item=pumpkin_pie,quantity=1..}] pumpkin_pie 0 1