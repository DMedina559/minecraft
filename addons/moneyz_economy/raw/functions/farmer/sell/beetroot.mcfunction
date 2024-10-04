tell @initiator[hasitem={item=beetroot,quantity=..9}] §cYou can't sell 10 Beetroots!

tell @initiator[hasitem={item=beetroot,quantity=10..}] §aYou can sell 10 Beetroots!

scoreboard players add @initiator[hasitem={item=beetroot,quantity=10..}] Moneyz 5

tell @initiator[hasitem={item=beetroot,quantity=10..}] §aSold 10 Beetroots!

clear @initiator[hasitem={item=beetroot,quantity=10..}] beetroot 0 10