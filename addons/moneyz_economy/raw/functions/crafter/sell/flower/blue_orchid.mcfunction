playsound note.bassattack @initiator[hasitem={item=blue_orchid,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=blue_orchid,quantity=..4}] §cYou can't sell 5 Blue Orchids!

playsound random.levelup @initiator[hasitem={item=blue_orchid,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=blue_orchid,quantity=5..}] §aYou can sell 5 Blue Orchids!

scoreboard players add @initiator[hasitem={item=blue_orchid,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=blue_orchid,quantity=5..}] §aSold 5 Blue Orchids!

clear @initiator[hasitem={item=blue_orchid,quantity=5..}] blue_orchid 0 5