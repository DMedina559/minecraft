
playsound note.bassattack @initiator[hasitem={item=crimson_planks,quantity=..19}] ~ ~ ~

tell @initiator[hasitem={item=crimson_planks,quantity=..19}] §cYou can't sell 20 Crimson Planks!

playsound random.levelup @initiator[hasitem={item=crimson_planks,quantity=20..}] ~ ~ ~

tell @initiator[hasitem={item=crimson_planks,quantity=20..}] §aYou can sell 20 Crimson Planks!

scoreboard players add @initiator[hasitem={item=crimson_planks,quantity=20..}] Moneyz 15

tell @initiator[hasitem={item=crimson_planks,quantity=20..}] §aSold 20 Crimson Planks!

clear @initiator[hasitem={item=crimson_planks,quantity=20..}] crimson_planks 0 20