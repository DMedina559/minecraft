playsound note.bassattack @initiator[hasitem={item=andesite,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=andesite,quantity=..4}] §cYou can't sell 5 Andesite!

playsound random.levelup @initiator[hasitem={item=andesite,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=andesite,quantity=5..}] §aYou can sell 5 Andesite!

scoreboard players add @initiator[hasitem={item=andesite,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=andesite,quantity=5..}] §aSold 5 Andesite!

clear @initiator[hasitem={item=andesite,quantity=5..}] andesite 0 5