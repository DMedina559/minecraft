tell @initiator §aYou've applied for Builder

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

tag @initiator[tag=apply] add builder

tag @initiator[tag=apply] remove apply

tell @initiator[tag=builder] §aYou're now a Builder