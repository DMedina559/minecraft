playsound note.bassattack @initiator[hasitem={item=cooked_salmon,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=cooked_salmon,quantity=..4}] §cYou can't sell 5 Cooked Salmons!

playsound random.levelup @initiator[hasitem={item=cooked_salmon,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=cooked_salmon,quantity=5..}] §aYou can sell 5 Cooked Salmons!

scoreboard players add @initiator[hasitem={item=cooked_salmon,quantity=5..}] Moneyz 30

tell @initiator[hasitem={item=cooked_salmon,quantity=5..}] §aSold 5 Cooked Salmons!

clear @initiator[hasitem={item=cooked_salmon,quantity=5..}] cooked_salmon  5
