tell @initiator §aYou've applied for Builder

playsound note.bassattack @initiator[tag=!apply] ~ ~ ~

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

playsound random.levelup @initiator[tag=apply]  ~ ~ ~

tag @initiator[tag=apply] add builder

tag @initiator[tag=apply] remove apply

tell @initiator[tag=builder] §aYou're now a Builder