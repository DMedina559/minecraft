playsound note.bassattack @initiator[hasitem={item=crimson_fungus,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=crimson_fungus,quantity=..4}] §cYou can't sell 5 Crimson Fungi!

playsound random.levelup @initiator[hasitem={item=crimson_fungus,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=crimson_fungus,quantity=5..}] §aYou can sell 5 Crimson Fungi!

scoreboard players add @initiator[hasitem={item=crimson_fungus,quantity=5..}] Moneyz 10

tell @initiator[hasitem={item=crimson_fungus,quantity=5..}] §aSold 5 Crimson Fungi!

clear @initiator[hasitem={item=crimson_fungus,quantity=5..}] crimson_fungus 0 5