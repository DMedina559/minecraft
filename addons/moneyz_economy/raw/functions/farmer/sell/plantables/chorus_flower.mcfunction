playsound note.bassattack @initiator[hasitem={item=chorus_flower,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=chorus_flower,quantity=..0}] §cYou can't sell a Chorus Flower!

playsound random.levelup @initiator[hasitem={item=chorus_flower,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=chorus_flower,quantity=1..}] §aYou can sell a Chorus Flower!

scoreboard players add @initiator[hasitem={item=chorus_flower,quantity=1..}] Moneyz 10

tell @initiator[hasitem={item=chorus_flower,quantity=1..}] §aSold a Chorus Flower!

clear @initiator[hasitem={item=chorus_flower,quantity=1..}] chorus_flower 0 1