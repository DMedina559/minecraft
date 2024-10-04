tell @initiator[hasitem={item=glow_berries,quantity=..4}] §cYou can't sell 10 Glow Berries!

tell @initiator[hasitem={item=glow_berries,quantity=10..}] §aYou can sell 10 Glow Berries!

scoreboard players add @initiator[hasitem={item=glow_berries,quantity=10..}] Moneyz 5

tell @initiator[hasitem={item=glow_berries,quantity=10..}] §aSold 10 Glow Berries!

clear @initiator[hasitem={item=glow_berries,quantity=10..}] glow_berries 0 10