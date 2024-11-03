playsound note.bassattack @initiator[hasitem={item=azure_bluet,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=azure_bluet,quantity=..4}] §cYou can't sell 5 Azure Bluets!

playsound random.levelup @initiator[hasitem={item=azure_bluet,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=azure_bluet,quantity=5..}] §aYou can sell 5 Azure Bluets!

scoreboard players add @initiator[hasitem={item=azure_bluet,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=azure_bluet,quantity=5..}] §aSold 5 Azure Bluets!

clear @initiator[hasitem={item=azure_bluet,quantity=5..}] azure_bluet 0 5