tell @initiator §aYou've applied for Banker

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

tag @initiator[tag=apply] add banker

tag @initiator[tag=apply] remove apply

tell @initiator[tag=banker] §aYou're now a Banker