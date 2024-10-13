playsound note.bassattack @initiator[hasitem={item=wind_charge,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=wind_charge,quantity=..9}] §cYou can't sell 10 Wind Charges!

playsound random.levelup @initiator[hasitem={item=wind_charge,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=wind_charge,quantity=10..}] §aYou can sell 10 Wind Charges!

scoreboard players add @initiator[hasitem={item=wind_charge,quantity=10..}] Moneyz 25

tell @initiator[hasitem={item=wind_charge,quantity=10..}] §aSold 10 Wind Charges!

clear @initiator[hasitem={item=wind_charge,quantity=10..}] wind_charge 0 10