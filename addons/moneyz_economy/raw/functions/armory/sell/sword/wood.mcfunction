playsound note.bassattack @initiator[hasitem={item=wooden_sword,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=wooden_sword,quantity=..0}] §cYou can't sell a Wood Sword!

playsound random.levelup @initiator[hasitem={item=wooden_sword,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=wooden_sword,quantity=1..}] §aYou can sell a Wood Sword!

scoreboard players add @initiator[hasitem={item=wooden_sword,quantity=1..}] Moneyz 100

tell @initiator[hasitem={item=wooden_sword,quantity=1..}] §aSold a Wood Sword!

clear @initiator[hasitem={item=wooden_sword,quantity=1..}] wooden_sword 0 1