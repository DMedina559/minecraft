playsound note.bassattack @initiator[hasitem={item=cooked_porkchop,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=cooked_porkchop,quantity=..4}] §cYou can't sell 5 Cooked Porkchops!

playsound random.levelup @initiator[hasitem={item=cooked_porkchop,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=cooked_porkchop,quantity=5..}] §aYou can sell 5 Cooked Porkchops!

scoreboard players add @initiator[hasitem={item=cooked_porkchop,quantity=5..}] Moneyz 25

tell @initiator[hasitem={item=cooked_porkchop,quantity=5..}] §aSold 5 Cooked Porkchops!

clear @initiator[hasitem={item=cooked_porkchop,quantity=5..}] cooked_porkchop  5
