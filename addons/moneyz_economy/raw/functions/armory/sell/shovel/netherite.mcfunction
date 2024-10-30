playsound note.bassattack @initiator[hasitem={item=netherite_shovel,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=netherite_shovel,quantity=..0}] §cYou can't sell a Netherite Shovel!

playsound random.levelup @initiator[hasitem={item=netherite_shovel,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=netherite_shovel,quantity=1..}] §aYou can sell a Netherite Shovel!

scoreboard players add @initiator[hasitem={item=netherite_shovel,quantity=1..}] Moneyz 600

tell @initiator[hasitem={item=netherite_shovel,quantity=1..}] §aSold a Netherite Shovel!

clear @initiator[hasitem={item=netherite_shovel,quantity=1..}] netherite_shovel -1 1