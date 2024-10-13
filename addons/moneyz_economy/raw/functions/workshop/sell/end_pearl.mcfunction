playsound note.bassattack @initiator[hasitem={item=ender_pearl,quantity=..15}] ~ ~ ~

tell @initiator[hasitem={item=ender_pearl,quantity=..15}] §cYou can't sell 16 Ender Pearls!

playsound random.levelup @initiator[hasitem={item=ender_pearl,quantity=16..}] ~ ~ ~

tell @initiator[hasitem={item=ender_pearl,quantity=16..}] §aYou can sell 16 Ender Pearls!

scoreboard players add @initiator[hasitem={item=ender_pearl,quantity=16..}] Moneyz 500

tell @initiator[hasitem={item=ender_pearl,quantity=16..}] §aSold 16 Ender Pearls!

clear @initiator[hasitem={item=ender_pearl,quantity=16..}] ender_pearl 0 16