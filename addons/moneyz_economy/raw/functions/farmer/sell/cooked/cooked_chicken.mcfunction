playsound note.bassattack @initiator[hasitem={item=cooked_chicken,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=cooked_chicken,quantity=..4}] §cYou can't sell 5 Cooked Chickens!

playsound random.levelup @initiator[hasitem={item=cooked_chicken,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=cooked_chicken,quantity=5..}] §aYou can sell 5 Cooked Chickens!

scoreboard players add @initiator[hasitem={item=cooked_chicken,quantity=5..}] Moneyz 35

tell @initiator[hasitem={item=cooked_chicken,quantity=5..}] §aSold 5 Cooked Chickens!

clear @initiator[hasitem={item=cooked_chicken,quantity=5..}] cooked_chicken  5
