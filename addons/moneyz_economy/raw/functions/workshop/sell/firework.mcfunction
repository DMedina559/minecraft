tell @initiator[hasitem={item=firework_rocket,quantity=..9}] §cYou can't sell 10 Fireworks!

tell @initiator[hasitem={item=firework_rocket,quantity=10..}] §aYou can sell 10 Fireworks!

scoreboard players add @initiator[hasitem={item=firework_rocket,quantity=10..}] Moneyz 25

tell @initiator[hasitem={item=firework_rocket,quantity=10..}] §aSold 10 Fireworks!

clear @initiator[hasitem={item=firework_rocket,quantity=10..}] firework_rocket 3 10