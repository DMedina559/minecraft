playsound note.bassattack @initiator[hasitem={item=cobbled_deepslate,quantity=..14}] ~ ~ ~

tell @initiator[hasitem={item=cobbled_deepslate,quantity=..14}] §cYou can't sell 15 Cobbled Deepslate!

playsound random.levelup @initiator[hasitem={item=cobbled_deepslate,quantity=15..}] ~ ~ ~

tell @initiator[hasitem={item=cobbled_deepslate,quantity=15..}] §aYou can sell 15 Cobbled Deepslate!

scoreboard players add @initiator[hasitem={item=cobbled_deepslate,quantity=15..}] Moneyz 15

tell @initiator[hasitem={item=cobbled_deepslate,quantity=15..}] §aSold 15 Cobbled Deepslate!

clear @initiator[hasitem={item=cobbled_deepslate,quantity=15..}] cobbled_deepslate 0 15