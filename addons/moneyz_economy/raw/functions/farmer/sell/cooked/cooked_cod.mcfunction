playsound note.bassattack @initiator[hasitem={item=cooked_cod,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=cooked_cod,quantity=..4}] §cYou can't sell 5 Cooked Cods!

playsound random.levelup @initiator[hasitem={item=cooked_cod,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=cooked_cod,quantity=5..}] §aYou can sell 5 Cooked Cods!

scoreboard players add @initiator[hasitem={item=cooked_cod,quantity=5..}] Moneyz 25

tell @initiator[hasitem={item=cooked_cod,quantity=5..}] §aSold 5 Cooked Cods!

clear @initiator[hasitem={item=cooked_cod,quantity=5..}] cooked_cod  5
