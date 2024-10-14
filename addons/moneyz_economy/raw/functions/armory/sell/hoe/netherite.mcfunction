playsound note.bassattack @initiator[hasitem={item=netherite_hoe,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=netherite_hoe,quantity=..0}] §cYou can't sell a Netherite Hoe!

playsound random.levelup @initiator[hasitem={item=netherite_hoe,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=netherite_hoe,quantity=1..}] §aYou can sell a Netherite Hoe!

scoreboard players add @initiator[hasitem={item=netherite_hoe,quantity=1..}] Moneyz 500

tell @initiator[hasitem={item=netherite_hoe,quantity=1..}] §aSold a Netherite Hoe!

clear @initiator[hasitem={item=netherite_hoe,quantity=1..}] netherite_hoe 0 1