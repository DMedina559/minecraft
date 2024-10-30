playsound note.bassattack @initiator[hasitem={item=golden_sword,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=golden_sword,quantity=..0}] §cYou can't sell a Gold Sword!

playsound random.levelup @initiator[hasitem={item=golden_sword,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=golden_sword,quantity=1..}] §aYou can sell a Gold Sword!

scoreboard players add @initiator[hasitem={item=golden_sword,quantity=1..}] Moneyz 300

tell @initiator[hasitem={item=golden_sword,quantity=1..}] §aSold a Gold Sword!

clear @initiator[hasitem={item=golden_sword,quantity=1..}] golden_sword -1 1