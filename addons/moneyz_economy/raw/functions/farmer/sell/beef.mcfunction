tell @initiator[hasitem={item=beef,quantity=..4}] §cYou can't sell 5 Raw Beefs!

tell @initiator[hasitem={item=beef,quantity=5..}] §aYou can sell 5 Raw Beefs!

scoreboard players add @initiator[hasitem={item=beef,quantity=5..}] Moneyz 30

tell @initiator[hasitem={item=beef,quantity=5..}] §aSold 5 Raw Beefs!

clear @initiator[hasitem={item=beef,quantity=5..}] beef 0 5