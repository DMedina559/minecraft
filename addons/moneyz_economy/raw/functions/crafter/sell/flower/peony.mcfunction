playsound note.bassattack @initiator[hasitem={item=peony,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=peony,quantity=..4}] §cYou can't sell 5 Peonies!

playsound random.levelup @initiator[hasitem={item=peony,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=peony,quantity=5..}] §aYou can sell 5 Peonies!

scoreboard players add @initiator[hasitem={item=peony,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=peony,quantity=5..}] §aSold 5 Peonies!

clear @initiator[hasitem={item=peony,quantity=5..}] peony 0 5