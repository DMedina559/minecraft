playsound note.bassattack @initiator[hasitem={item=cooked_mutton,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=cooked_mutton,quantity=..4}] §cYou can't sell 5 Cooked Muttons!

playsound random.levelup @initiator[hasitem={item=cooked_mutton,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=cooked_mutton,quantity=5..}] §aYou can sell 5 Cooked Muttons!

scoreboard players add @initiator[hasitem={item=cooked_mutton,quantity=5..}] Moneyz 30

tell @initiator[hasitem={item=cooked_mutton,quantity=5..}] §aSold 5 Cooked Muttons!

clear @initiator[hasitem={item=cooked_mutton,quantity=5..}] cooked_mutton  5
