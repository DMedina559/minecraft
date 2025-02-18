playsound note.bassattack @initiator[hasitem={item=torch,quantity=..24}] ~ ~ ~

tell @initiator[hasitem={item=torch,quantity=..24}] §cYou can't sell 25 Torchs!

playsound random.levelup @initiator[hasitem={item=torch,quantity=25..}] ~ ~ ~

tell @initiator[hasitem={item=torch,quantity=25..}] §aYou can sell 25 Torchs!

scoreboard players add @initiator[hasitem={item=torch,quantity=25..}] Moneyz 15

tell @initiator[hasitem={item=torch,quantity=25..}] §aSold 25 Torchs!

clear @initiator[hasitem={item=torch,quantity=25..}] torch  25
