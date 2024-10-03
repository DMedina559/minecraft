execute as @initiator[tag=apply] run tell @s §cYou already have the Apply Tag. You can apply for the job you want.

execute as @initiator[tag=!apply] run tell @s §aYou got the Apply Tag, you can apply for the job you want!

tag @initiator add apply
