playsound note.bassattack @initiator[hasitem={item=ochre_froglight,quantity=..14}] ~ ~ ~

tell @initiator[hasitem={item=ochre_froglight,quantity=..14}] §cYou can't sell 15 Ochre Froglights!

playsound random.levelup @initiator[hasitem={item=ochre_froglight,quantity=15..}] ~ ~ ~

tell @initiator[hasitem={item=ochre_froglight,quantity=15..}] §aYou can sell 15 Ochre Froglights!

scoreboard players add @initiator[hasitem={item=ochre_froglight,quantity=15..}] Moneyz 45

tell @initiator[hasitem={item=ochre_froglight,quantity=15..}] §aSold 15 Ochre Froglights!

clear @initiator[hasitem={item=ochre_froglight,quantity=15..}] ochre_froglight  15
