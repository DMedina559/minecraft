tell @initiator §aYou've applied for Lawyer

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

tag @initiator[tag=apply] add lawyer

tag @initiator[tag=apply] remove apply

tell @initiator[tag=lawyer] §aYou're now a Lawyer