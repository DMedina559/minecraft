playsound note.bassattack @initiator[hasitem={item=milk_bucket,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=milk_bucket,quantity=..0}] §cYou can't sell a Bucket of Milk!

playsound random.levelup @initiator[hasitem={item=milk_bucket,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=milk_bucket,quantity=1..}] §aYou can sell a Bucket of Milk!

scoreboard players add @initiator[hasitem={item=milk_bucket,quantity=1..}] Moneyz 25

tell @initiator[hasitem={item=milk_bucket,quantity=1..}] §aSold a Bucket of Milk!

clear @initiator[hasitem={item=milk_bucket,quantity=1..}] milk_bucket 0 1