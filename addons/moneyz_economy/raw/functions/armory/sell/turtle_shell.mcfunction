playsound note.bassattack @initiator[hasitem={item=turtle_shell,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=turtle_shell,quantity=..0}] §cYou can't sell a Turtle Shell!

playsound random.levelup @initiator[hasitem={item=turtle_shell,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=turtle_shell,quantity=1..}] §aYou can sell a Turtle Shell!

scoreboard players add @initiator[hasitem={item=turtle_shell,quantity=1..}] Moneyz 100

tell @initiator[hasitem={item=turtle_shell,quantity=1..}] §aSold a Turtle Shell!

clear @initiator[hasitem={item=turtle_shell,quantity=1..}] turtle_shell 0 1