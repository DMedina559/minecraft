tell @initiator §aYou've applied for Fisher

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

tag @initiator[tag=apply] add fisher

tag @initiator[tag=apply] remove apply

tell @initiator[tag=fisher] §aYou're now a Fisher 