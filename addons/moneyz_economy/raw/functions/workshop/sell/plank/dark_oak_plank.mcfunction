playsound note.bassattack @initiator[hasitem={item=dark_oak_planks,quantity=..19}] ~ ~ ~

tell @initiator[hasitem={item=dark_oak_planks,quantity=..19}] §cYou can't sell 20 Dark Oak Planks!

playsound random.levelup @initiator[hasitem={item=dark_oak_planks,quantity=20..}] ~ ~ ~

tell @initiator[hasitem={item=dark_oak_planks,quantity=20..}] §aYou can sell 20 Dark Oak Planks!

scoreboard players add @initiator[hasitem={item=dark_oak_planks,quantity=20..}] Moneyz 5

tell @initiator[hasitem={item=dark_oak_planks,quantity=20..}] §aSold 20 Dark Oak Planks!

clear @initiator[hasitem={item=dark_oak_planks,quantity=20..}] dark_oak_planks 0 20