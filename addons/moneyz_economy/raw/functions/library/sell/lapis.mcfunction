playsound note.bassattack @initiator[hasitem={item=lapis_lazuli,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=lapis_lazuli,quantity=..4}] §cYou can't sell 5 Lapis Lazuli!

playsound random.levelup @initiator[hasitem={item=lapis_lazuli,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=lapis_lazuli,quantity=5..}] §aYou can sell 5 Lapis Lazuli!

scoreboard players add @initiator[hasitem={item=lapis_lazuli,quantity=5..}] Moneyz 30

tell @initiator[hasitem={item=lapis_lazuli,quantity=5..}] §aSold 5 Lapis Lazuli!

clear @initiator[hasitem={item=lapis_lazuli,quantity=5..}] lapis_lazuli 0 5