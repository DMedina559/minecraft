playsound note.bassattack @initiator[hasitem={item=deepslate,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=deepslate,quantity=..4}] §cYou can't sell 5 Deepslate!

playsound random.levelup @initiator[hasitem={item=deepslate,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=deepslate,quantity=5..}] §aYou can sell 5 Deepslate!

scoreboard players add @initiator[hasitem={item=deepslate,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=deepslate,quantity=5..}] §aSold 5 Deepslate!

clear @initiator[hasitem={item=deepslate,quantity=5..}] deepslate 0 5