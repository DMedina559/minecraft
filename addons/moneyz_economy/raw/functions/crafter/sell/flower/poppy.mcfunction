playsound note.bassattack @initiator[hasitem={item=poppy,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=poppy,quantity=..4}] §cYou can't sell 5 Poppies!

playsound random.levelup @initiator[hasitem={item=poppy,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=poppy,quantity=5..}] §aYou can sell 5 Poppies!

scoreboard players add @initiator[hasitem={item=poppy,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=poppy,quantity=5..}] §aSold 5 Poppies!

clear @initiator[hasitem={item=poppy,quantity=5..}] poppy 0 5