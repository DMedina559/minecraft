playsound note.bassattack @initiator[hasitem={item=granite,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=granite,quantity=..4}] §cYou can't sell 5 Granite!

playsound random.levelup @initiator[hasitem={item=granite,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=granite,quantity=5..}] §aYou can sell 5 Granite!

scoreboard players add @initiator[hasitem={item=granite,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=granite,quantity=5..}] §aSold 5 Granite!

clear @initiator[hasitem={item=granite,quantity=5..}] granite 0 5