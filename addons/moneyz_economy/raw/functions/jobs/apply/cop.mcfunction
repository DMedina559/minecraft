tell @initiator §aYou've applied for Cop

playsound note.bassattack @initiator[tag=!apply] ~ ~ ~

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

playsound random.levelup @initiator[tag=apply]  ~ ~ ~

tag @initiator[tag=apply] add cop

tag @initiator[tag=apply] remove apply

tell @initiator[tag=cop] §aYou're now a Cop