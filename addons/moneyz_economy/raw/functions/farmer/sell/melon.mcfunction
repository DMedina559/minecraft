tell @initiator[hasitem={item=melon_slice,quantity=..9}] §cYou can't sell 10 Melons!

tell @initiator[hasitem={item=melon_slice,quantity=10..}] §aYou can sell 10 Melons!

scoreboard players add @initiator[hasitem={item=melon_slice,quantity=10..}] Moneyz 5

tell @initiator[hasitem={item=melon_slice,quantity=10..}] §aSold 10 Melons!

clear @initiator[hasitem={item=melon_slice,quantity=10..}] melon_slice 0 10