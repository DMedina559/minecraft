tell @initiator §aYou've applied for Farmer

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

tag @initiator[tag=apply] add commufarmer

tag @initiator[tag=apply] remove apply

tell @initiator[tag=commufarmer] §aYou're now a Farmer for Commu