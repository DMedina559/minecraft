
playsound note.bassattack @initiator[hasitem={item=crimson_stem,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=crimson_stem,quantity=..4}] §cYou can't sell 5 Crimson Stems!

playsound random.levelup @initiator[hasitem={item=crimson_stem,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=crimson_stem,quantity=5..}] §aYou can sell 5 Crimson Stems!

scoreboard players add @initiator[hasitem={item=crimson_stem,quantity=5..}] Moneyz 20

tell @initiator[hasitem={item=crimson_stem,quantity=5..}] §aSold 5 Crimson Stems!

clear @initiator[hasitem={item=crimson_stem,quantity=5..}] crimson_stem 0 5