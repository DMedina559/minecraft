playsound note.bassattack @initiator[hasitem={item=sea_lantern,quantity=..14}] ~ ~ ~

tell @initiator[hasitem={item=sea_lantern,quantity=..14}] §cYou can't sell 15 Sea Lanterns!

playsound random.levelup @initiator[hasitem={item=sea_lantern,quantity=15..}] ~ ~ ~

tell @initiator[hasitem={item=sea_lantern,quantity=15..}] §aYou can sell 15 Sea Lanterns!

scoreboard players add @initiator[hasitem={item=sea_lantern,quantity=15..}] Moneyz 55

tell @initiator[hasitem={item=sea_lantern,quantity=15..}] §aSold 15 Sea Lanterns!

clear @initiator[hasitem={item=sea_lantern,quantity=15..}] sea_lantern  15
