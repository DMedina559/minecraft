playsound note.bassattack @initiator[hasitem={item=warped_fungus,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=warped_fungus,quantity=..4}] §cYou can't sell 5 Warped Fungi!

playsound random.levelup @initiator[hasitem={item=warped_fungus,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=warped_fungus,quantity=5..}] §aYou can sell 5 Warped Fungi!

scoreboard players add @initiator[hasitem={item=warped_fungus,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=warped_fungus,quantity=5..}] §aSold 5 Warped Fungi!

clear @initiator[hasitem={item=warped_fungus,quantity=5..}] warped_fungus 0 5