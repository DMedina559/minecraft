playsound note.bassattack @initiator[hasitem={item=verdant_froglight,quantity=..14}] ~ ~ ~

tell @initiator[hasitem={item=verdant_froglight,quantity=..14}] §cYou can't sell 15 Verdant Froglights!

playsound random.levelup @initiator[hasitem={item=verdant_froglight,quantity=15..}] ~ ~ ~

tell @initiator[hasitem={item=verdant_froglight,quantity=15..}] §aYou can sell 15 Verdant Froglights!

scoreboard players add @initiator[hasitem={item=verdant_froglight,quantity=15..}] Moneyz 45

tell @initiator[hasitem={item=verdant_froglight,quantity=15..}] §aSold 15 Verdant Froglights!

clear @initiator[hasitem={item=verdant_froglight,quantity=15..}] verdant_froglight  15
