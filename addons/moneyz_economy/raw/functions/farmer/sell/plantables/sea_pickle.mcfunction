playsound note.bassattack @initiator[hasitem={item=sea_pickle,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=sea_pickle,quantity=..4}] §cYou can't sell 5 Sea Pickles!

playsound random.levelup @initiator[hasitem={item=sea_pickle,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=sea_pickle,quantity=5..}] §aYou can sell 5 Sea Pickles!

scoreboard players add @initiator[hasitem={item=sea_pickle,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=sea_pickle,quantity=5..}] §aSold 5 Sea Pickles!

clear @initiator[hasitem={item=sea_pickle,quantity=5..}] sea_pickle 0 5