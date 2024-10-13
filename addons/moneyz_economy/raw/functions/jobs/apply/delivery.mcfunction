tell @initiator §aYou've applied for Delivery Person

playsound note.bassattack @initiator[tag=!apply] ~ ~ ~

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

playsound random.levelup @initiator[tag=apply]  ~ ~ ~

tag @initiator[tag=apply] add delivery

tag @initiator[tag=apply] remove apply

tell @initiator[tag=delivery] §aYou're now a Delivery Person