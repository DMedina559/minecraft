playsound note.bassattack @initiator[hasitem={item=wooden_axe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=wooden_axe,quantity=..0}] §cYou can't sell a Wood Axe!

playsound random.levelup @initiator[hasitem={item=wooden_axe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=wooden_axe,quantity=1..}] §aYou can sell a Wood Axe!

scoreboard players add @initiator[hasitem={item=wooden_axe,quantity=1..}] Moneyz 200

tell @initiator[hasitem={item=wooden_axe,quantity=1..}] §aSold a Wood Axe!

clear @initiator[hasitem={item=wooden_axe,quantity=1..}] wooden_axe -1 1