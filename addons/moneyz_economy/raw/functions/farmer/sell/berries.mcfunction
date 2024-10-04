tell @initiator[hasitem={item=sweet_berries,quantity=..9}] §cYou can't sell 10 Sweet Berries!

tell @initiator[hasitem={item=sweet_berries,quantity=10..}] §aYou can sell 10 Sweet Berries!

scoreboard players add @initiator[hasitem={item=sweet_berries,quantity=10..}] Moneyz 5

tell @initiator[hasitem={item=sweet_berries,quantity=10..}] §aSold 10 Sweet Berries!

clear @initiator[hasitem={item=sweet_berries,quantity=10..}] sweet_berries 0 10