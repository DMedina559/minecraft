tell @initiator[hasitem={item=honey_bottle,quantity=..0}] §cYou can't sell a Honey Bottle!

tell @initiator[hasitem={item=honey_bottle,quantity=1..}] §aYou can sell a Honey Bottle!

scoreboard players add @initiator[hasitem={item=honey_bottle,quantity=1..}] Moneyz 10

tell @initiator[hasitem={item=honey_bottle,quantity=1..}] §aSold a Honey Bottle!

clear @initiator[hasitem={item=honey_bottle,quantity=1..}] honey_bottle 0 1