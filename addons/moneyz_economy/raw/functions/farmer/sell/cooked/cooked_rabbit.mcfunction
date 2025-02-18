playsound note.bassattack @initiator[hasitem={item=cooked_rabbit,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=cooked_rabbit,quantity=..4}] §cYou can't sell 5 Cooked Rabbits!

playsound random.levelup @initiator[hasitem={item=cooked_rabbit,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=cooked_rabbit,quantity=5..}] §aYou can sell 5 Cooked Rabbits!

scoreboard players add @initiator[hasitem={item=cooked_rabbit,quantity=5..}] Moneyz 30

tell @initiator[hasitem={item=cooked_rabbit,quantity=5..}] §aSold 5 Cooked Rabbits!

clear @initiator[hasitem={item=cooked_rabbit,quantity=5..}] cooked_rabbit  5
