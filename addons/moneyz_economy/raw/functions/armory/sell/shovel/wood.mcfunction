playsound note.bassattack @initiator[hasitem={item=wooden_shovel,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=wooden_shovel,quantity=..0}] §cYou can't sell a Wood Shovel!

playsound random.levelup @initiator[hasitem={item=wooden_shovel,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=wooden_shovel,quantity=1..}] §aYou can sell a Wood Shovel!

scoreboard players add @initiator[hasitem={item=wooden_shovel,quantity=1..}] Moneyz 100

tell @initiator[hasitem={item=wooden_shovel,quantity=1..}] §aSold a Wood Shovel!

clear @initiator[hasitem={item=wooden_shovel,quantity=1..}] wooden_shovel -1 1