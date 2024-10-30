playsound note.bassattack @initiator[hasitem={item=mace,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=mace,quantity=..0}] §cYou can't sell a Mace!

playsound random.levelup @initiator[hasitem={item=mace,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=mace,quantity=1..}] §aYou can sell a Mace!

scoreboard players add @initiator[hasitem={item=mace,quantity=1..}] Moneyz 500

tell @initiator[hasitem={item=mace,quantity=1..}] §aSold a Mace!

clear @initiator[hasitem={item=mace,quantity=1..}] mace -1 1