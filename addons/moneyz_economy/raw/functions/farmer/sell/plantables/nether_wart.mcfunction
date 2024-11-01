playsound note.bassattack @initiator[hasitem={item=nether_wart,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=nether_wart,quantity=..4}] §cYou can't sell 5 Nether Warts!

playsound random.levelup @initiator[hasitem={item=nether_wart,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=nether_wart,quantity=5..}] §aYou can sell 5 Nether Warts!

scoreboard players add @initiator[hasitem={item=nether_wart,quantity=5..}] Moneyz 15

tell @initiator[hasitem={item=nether_wart,quantity=5..}] §aSold 5 Nether Warts!

clear @initiator[hasitem={item=nether_wart,quantity=5..}] nether_wart 0 5