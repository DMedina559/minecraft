tell @initiator §aYou've applied for Farmer

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

tag @initiator[tag=apply] add farmer

tag @initiator[tag=apply] remove apply

tell @initiator[tag=farmer] §aYou're now a Farmer