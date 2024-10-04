tell @initiator[hasitem={item=nether_star,quantity=..0}] §cYou can't sell a Nether Star!

tell @initiator[hasitem={item=nether_star,quantity=1..}] §aYou can sell a Nether Star!

scoreboard players add @initiator[hasitem={item=nether_star,quantity=1..}] Moneyz 500

tell @initiator[hasitem={item=nether_star,quantity=1..}] §aSold a Nether Star!

clear @initiator[hasitem={item=nether_star,quantity=1..}] nether_star 0 1