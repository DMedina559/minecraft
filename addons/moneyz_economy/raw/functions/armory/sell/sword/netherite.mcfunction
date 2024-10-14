playsound note.bassattack @initiator[hasitem={item=netherite_sword,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=netherite_sword,quantity=..0}] §cYou can't sell a Netherite Sword!

playsound random.levelup @initiator[hasitem={item=netherite_sword,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=netherite_sword,quantity=1..}] §aYou can sell a Netherite Sword!

scoreboard players add @initiator[hasitem={item=netherite_sword,quantity=1..}] Moneyz 700

tell @initiator[hasitem={item=netherite_sword,quantity=1..}] §aSold a Netherite Sword!

clear @initiator[hasitem={item=netherite_sword,quantity=1..}] netherite_sword 0 1