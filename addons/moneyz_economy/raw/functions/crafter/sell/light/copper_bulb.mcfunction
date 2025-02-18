playsound note.bassattack @initiator[hasitem={item=copper_bulb,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=copper_bulb,quantity=..9}] §cYou can't sell 10 Copper Bulbs!

playsound random.levelup @initiator[hasitem={item=copper_bulb,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=copper_bulb,quantity=10..}] §aYou can sell 10 Copper Bulbs!

scoreboard players add @initiator[hasitem={item=copper_bulb,quantity=10..}] Moneyz 65

tell @initiator[hasitem={item=copper_bulb,quantity=10..}] §aSold 10 Copper Bulbs!

clear @initiator[hasitem={item=copper_bulb,quantity=10..}] copper_bulb  10
