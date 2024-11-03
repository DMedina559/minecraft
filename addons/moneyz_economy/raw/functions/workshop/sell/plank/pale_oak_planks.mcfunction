playsound note.bassattack @initiator[hasitem={item=pale_oak_planks,quantity=..19}] ~ ~ ~

tell @initiator[hasitem={item=pale_oak_planks,quantity=..19}] §cYou can't sell 20 Pale Oak Planks!

playsound random.levelup @initiator[hasitem={item=pale_oak_planks,quantity=20..}] ~ ~ ~

tell @initiator[hasitem={item=pale_oak_planks,quantity=20..}] §aYou can sell 20 Pale Oak Planks!

scoreboard players add @initiator[hasitem={item=pale_oak_planks,quantity=20..}] Moneyz 10

tell @initiator[hasitem={item=pale_oak_planks,quantity=20..}] §aSold 20 Pale Oak Planks!

clear @initiator[hasitem={item=pale_oak_planks,quantity=20..}] pale_oak_planks 0 20