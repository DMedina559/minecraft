playsound note.bassattack @initiator[hasitem={item=redstone_lamp,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=redstone_lamp,quantity=..9}] §cYou can't sell 10 Redstone Lamps!

playsound random.levelup @initiator[hasitem={item=redstone_lamp,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=redstone_lamp,quantity=10..}] §aYou can sell 10 Redstone Lamps!

scoreboard players add @initiator[hasitem={item=redstone_lamp,quantity=10..}] Moneyz 35

tell @initiator[hasitem={item=redstone_lamp,quantity=10..}] §aSold 10 Redstone Lamps!

clear @initiator[hasitem={item=redstone_lamp,quantity=10..}] redstone_lamp  10
