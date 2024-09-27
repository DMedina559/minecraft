tell @initiator §aYou've applied for Judge

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

tag @initiator[tag=apply] add judge

tag @initiator[tag=apply] remove apply

tell @initiator[tag=judge] §aYou're now a Justice