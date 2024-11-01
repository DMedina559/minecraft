playsound note.bassattack @initiator[hasitem={item=pitcher_pod,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=pitcher_pod,quantity=..0}] §cYou can't sell a Pitcher Pod!

playsound random.levelup @initiator[hasitem={item=pitcher_pod,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=pitcher_pod,quantity=1..}] §aYou can sell a Pitcher Pod!

scoreboard players add @initiator[hasitem={item=pitcher_pod,quantity=1..}] Moneyz 35

tell @initiator[hasitem={item=pitcher_pod,quantity=1..}] §aSold a Pitcher Pod!

clear @initiator[hasitem={item=pitcher_pod,quantity=1..}] pitcher_pod 0 1