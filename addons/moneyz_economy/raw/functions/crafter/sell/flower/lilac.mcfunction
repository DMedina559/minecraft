playsound note.bassattack @initiator[hasitem={item=lilac,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=lilac,quantity=..4}] §cYou can't sell 5 Lilacs!

playsound random.levelup @initiator[hasitem={item=lilac,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=lilac,quantity=5..}] §aYou can sell 5 Lilacs!

scoreboard players add @initiator[hasitem={item=lilac,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=lilac,quantity=5..}] §aSold 5 Lilacs!

clear @initiator[hasitem={item=lilac,quantity=5..}] lilac 0 5