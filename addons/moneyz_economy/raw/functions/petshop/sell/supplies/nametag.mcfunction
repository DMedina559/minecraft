playsound note.bassattack @initiator[hasitem={item=name_tag,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=name_tag,quantity=..0}] §cYou can't sell a Name Tag!

playsound random.levelup @initiator[hasitem={item=name_tag,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=name_tag,quantity=1..}] §aYou can sell a Name Tag!

scoreboard players add @initiator[hasitem={item=name_tag,quantity=1..}] Moneyz 25

tell @initiator[hasitem={item=name_tag,quantity=1..}] §aSold a Name Tag!

clear @initiator[hasitem={item=name_tag,quantity=1..}] name_tag 0 1