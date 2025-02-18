playsound note.bassattack @initiator[hasitem={item=soul_torch,quantity=..14}] ~ ~ ~

tell @initiator[hasitem={item=soul_torch,quantity=..14}] §cYou can't sell 15 Soul Torchs!

playsound random.levelup @initiator[hasitem={item=soul_torch,quantity=15..}] ~ ~ ~

tell @initiator[hasitem={item=soul_torch,quantity=15..}] §aYou can sell 15 Soul Torchs!

scoreboard players add @initiator[hasitem={item=soul_torch,quantity=15..}] Moneyz 10

tell @initiator[hasitem={item=soul_torch,quantity=15..}] §aSold 15 Soul Torchs!

clear @initiator[hasitem={item=soul_torch,quantity=15..}] soul_torch  15
