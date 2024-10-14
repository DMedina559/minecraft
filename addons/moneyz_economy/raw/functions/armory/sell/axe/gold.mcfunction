playsound note.bassattack @initiator[hasitem={item=golden_axe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=golden_axe,quantity=..0}] §cYou can't sell a Gold Axe!

playsound random.levelup @initiator[hasitem={item=golden_axe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=golden_axe,quantity=1..}] §aYou can sell a Gold Axe!

scoreboard players add @initiator[hasitem={item=golden_axe,quantity=1..}] Moneyz 400

tell @initiator[hasitem={item=golden_axe,quantity=1..}] §aSold a Gold Axe!

clear @initiator[hasitem={item=golden_axe,quantity=1..}] golden_axe 0 1