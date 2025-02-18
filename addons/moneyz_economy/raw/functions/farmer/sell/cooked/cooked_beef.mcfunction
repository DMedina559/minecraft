playsound note.bassattack @initiator[hasitem={item=cooked_beef,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=cooked_beef,quantity=..4}] §cYou can't sell 5 Cooked Beefs!

playsound random.levelup @initiator[hasitem={item=cooked_beef,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=cooked_beef,quantity=5..}] §aYou can sell 5 Cooked Beefs!

scoreboard players add @initiator[hasitem={item=cooked_beef,quantity=5..}] Moneyz 45

tell @initiator[hasitem={item=cooked_beef,quantity=5..}] §aSold 5 Cooked Beefs!

clear @initiator[hasitem={item=cooked_beef,quantity=5..}] cooked_beef  5
