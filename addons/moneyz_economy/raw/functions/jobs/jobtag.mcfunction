playsound note.bassattack @initiator[tag=apply] ~ ~ ~

execute as @initiator[tag=apply] run tell @s §cYou already have the Apply Tag. You can apply for the job you want.

playsound random.levelup @initiator[tag=!apply] ~ ~ ~

execute as @initiator[tag=!apply] run tell @s §aYou got the Apply Tag, you can apply for the job you want!

tag @initiator[tag=!apply] add apply
