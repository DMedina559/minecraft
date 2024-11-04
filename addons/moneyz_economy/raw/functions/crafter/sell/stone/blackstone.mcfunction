playsound note.bassattack @initiator[hasitem={item=blackstone,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=blackstone,quantity=..9}] §cYou can't sell Blackstones!

playsound random.levelup @initiator[hasitem={item=blackstone,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=blackstone,quantity=10..}] §aYou can sell Blackstones!

scoreboard players add @initiator[hasitem={item=blackstone,quantity=10..}] Moneyz 15

tell @initiator[hasitem={item=blackstone,quantity=10..}] §aSold Blackstones!

clear @initiator[hasitem={item=blackstone,quantity=10..}] blackstone 0 10