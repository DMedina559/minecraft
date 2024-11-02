
playsound note.bassattack @initiator[hasitem={item=warped_stem,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=warped_stem,quantity=..4}] §cYou can't sell 5 Warped Stems!

playsound random.levelup @initiator[hasitem={item=warped_stem,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=warped_stem,quantity=5..}] §aYou can sell 5 Warped Stems!

scoreboard players add @initiator[hasitem={item=warped_stem,quantity=5..}] Moneyz 20

tell @initiator[hasitem={item=warped_stem,quantity=5..}] §aSold 5 Warped Stems!

clear @initiator[hasitem={item=warped_stem,quantity=5..}] warped_stem 0 5