playsound note.bassattack @initiator[hasitem={item=pitcher_plant,quantity=..0}] ~ ~ ~

tell @initiator[hasitem={item=pitcher_plant,quantity=..0}] §cYou can't sell a Pitcher Plant!

playsound random.levelup @initiator[hasitem={item=pitcher_plant,quantity=1..}] ~ ~ ~

tell @initiator[hasitem={item=pitcher_plant,quantity=1..}] §aYou can sell a Pitcher Plant!

scoreboard players add @initiator[hasitem={item=pitcher_plant,quantity=1..}] Moneyz 40

tell @initiator[hasitem={item=pitcher_plant,quantity=1..}] §aSold a Pitcher Plant!

clear @initiator[hasitem={item=pitcher_plant,quantity=1..}] pitcher_plant 0 1