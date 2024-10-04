tell @initiator[hasitem={item=wind_charge,quantity=..63}] §cYou can't sell 64 Wind Charges!

tell @initiator[hasitem={item=wind_charge,quantity=64..}] §aYou can sell 64 Wind Charges!

scoreboard players add @initiator[hasitem={item=wind_charge,quantity=64..}] Moneyz 25

tell @initiator[hasitem={item=wind_charge,quantity=64..}] §aSold 64 Wind Charges!

clear @initiator[hasitem={item=wind_charge,quantity=64..}] wind_charge 0 64