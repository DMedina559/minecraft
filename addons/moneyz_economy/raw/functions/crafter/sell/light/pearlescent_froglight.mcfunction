playsound note.bassattack @initiator[hasitem={item=pearlescent_froglight,quantity=..14}] ~ ~ ~

tell @initiator[hasitem={item=pearlescent_froglight,quantity=..14}] §cYou can't sell 15 Pearlescent Froglights!

playsound random.levelup @initiator[hasitem={item=pearlescent_froglight,quantity=15..}] ~ ~ ~

tell @initiator[hasitem={item=pearlescent_froglight,quantity=15..}] §aYou can sell 15 Pearlescent Froglights!

scoreboard players add @initiator[hasitem={item=pearlescent_froglight,quantity=15..}] Moneyz 45

tell @initiator[hasitem={item=pearlescent_froglight,quantity=15..}] §aSold 15 Pearlescent Froglights!

clear @initiator[hasitem={item=pearlescent_froglight,quantity=15..}] pearlescent_froglight  15
