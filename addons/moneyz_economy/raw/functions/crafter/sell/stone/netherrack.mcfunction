playsound note.bassattack @initiator[hasitem={item=netherrack,quantity=..14}] ~ ~ ~

tell @initiator[hasitem={item=netherrack,quantity=..14}] §cYou can't sell 15 Netherrack!

playsound random.levelup @initiator[hasitem={item=netherrack,quantity=15..}] ~ ~ ~

tell @initiator[hasitem={item=netherrack,quantity=15..}] §aYou can sell 15 Netherrack!

scoreboard players add @initiator[hasitem={item=netherrack,quantity=15..}] Moneyz 5

tell @initiator[hasitem={item=netherrack,quantity=15..}] §aSold 15 Netherrack!

clear @initiator[hasitem={item=netherrack,quantity=15..}] netherrack 0 15