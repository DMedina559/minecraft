playsound note.bassattack @initiator[hasitem={item=shroomlight,quantity=..24}] ~ ~ ~

tell @initiator[hasitem={item=shroomlight,quantity=..24}] §cYou can't sell 25 Shroomlights!

playsound random.levelup @initiator[hasitem={item=shroomlight,quantity=25..}] ~ ~ ~

tell @initiator[hasitem={item=shroomlight,quantity=25..}] §aYou can sell 25 Shroomlights!

scoreboard players add @initiator[hasitem={item=shroomlight,quantity=25..}] Moneyz 50

tell @initiator[hasitem={item=shroomlight,quantity=25..}] §aSold 25 Shroomlights!

clear @initiator[hasitem={item=shroomlight,quantity=25..}] shroomlight  25
