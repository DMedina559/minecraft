tell @initiator[hasitem={item=end_pearl,quantity=..15}] §cYou can't sell 16 End Pearls!

tell @initiator[hasitem={item=end_pearl,quantity=16..}] §aYou can sell 16 End Pearls!

scoreboard players add @initiator[hasitem={item=end_pearl,quantity=16..}] Moneyz 500

tell @initiator[hasitem={item=end_pearl,quantity=16..}] §aSold 16 End Pearls!

clear @initiator[hasitem={item=end_pearl,quantity=16..}] end_pearl 0 16