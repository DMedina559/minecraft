playsound note.bassattack @initiator[hasitem={item=chorus_fruit,quantity=..9}] ~ ~ ~

tell @initiator[hasitem={item=chorus_fruit,quantity=..9}] §cYou can't sell 10 Chorus Fruits!

playsound random.levelup @initiator[hasitem={item=chorus_fruit,quantity=10..}] ~ ~ ~

tell @initiator[hasitem={item=chorus_fruit,quantity=10..}] §aYou can sell 10 Chorus Fruits!

scoreboard players add @initiator[hasitem={item=chorus_fruit,quantity=10..}] Moneyz 75

tell @initiator[hasitem={item=chorus_fruit,quantity=10..}] §aSold 10 Chorus Fruits!

clear @initiator[hasitem={item=chorus_fruit,quantity=10..}] chorus_fruit 0 10