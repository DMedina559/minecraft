playsound note.bassattack @initiator[hasitem={item=wind_charge,quantity=..3}] ~ ~ ~

tell @initiator[hasitem={item=wind_charge,quantity=..3}] §cYou can't sell 4 Phantom Membranes!

playsound random.levelup @initiator[hasitem={item=wind_charge,quantity=4..}] ~ ~ ~

tell @initiator[hasitem={item=wind_charge,quantity=4..}] §aYou can sell 4 Phantom Membranes!

scoreboard players add @initiator[hasitem={item=wind_charge,quantity=4..}] Moneyz 100

tell @initiator[hasitem={item=wind_charge,quantity=4..}] §aSold 4 Phantom Membranes!

clear @initiator[hasitem={item=wind_charge,quantity=4..}] wind_charge 0 4