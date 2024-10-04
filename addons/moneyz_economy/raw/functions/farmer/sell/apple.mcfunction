tell @initiator[hasitem={item=apple,quantity=..9}] §cYou can't sell 10 Apples!

tell @initiator[hasitem={item=apple,quantity=10..}] §aYou can sell 10 Apples!

scoreboard players add @initiator[hasitem={item=apple,quantity=10..}] Moneyz 10

tell @initiator[hasitem={item=apple,quantity=10..}] §aSold 10 Apples!

clear @initiator[hasitem={item=apple,quantity=10..}] apple 0 10