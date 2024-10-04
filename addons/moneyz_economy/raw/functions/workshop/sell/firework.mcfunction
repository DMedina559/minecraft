tell @initiator[hasitem={item=firework_rocket,quantity=..63}] §cYou can't sell 64 Fireworks!

tell @initiator[hasitem={item=firework_rocket,quantity=64..}] §aYou can sell 64 Fireworks!

scoreboard players add @initiator[hasitem={item=firework_rocket,quantity=64..}] Moneyz 25

tell @initiator[hasitem={item=firework_rocket,quantity=64..}] §aSold 64 Fireworks!

clear @initiator[hasitem={item=firework_rocket,quantity=64..}] firework_rocket 3 64