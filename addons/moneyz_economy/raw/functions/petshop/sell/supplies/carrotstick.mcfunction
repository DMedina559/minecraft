playsound note.bassattack @initiator[hasitem={item=carrot_on_a_stick,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=carrot_on_a_stick,quantity=..0}] §cYou can't sell a Carrot on a Stick!

playsound random.levelup @initiator[hasitem={item=carrot_on_a_stick,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=carrot_on_a_stick,quantity=1..}] §aYou can sell a Carrot on a Stick!

scoreboard players add @initiator[hasitem={item=carrot_on_a_stick,quantity=1..}] Moneyz 30

tell @initiator[hasitem={item=carrot_on_a_stick,quantity=1..}] §aSold a Carrot on a Stick!

clear @initiator[hasitem={item=carrot_on_a_stick,quantity=1..}] carrot_on_a_stick -1 1