tell @initiator §aYou've applied for Hotel Owner

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

tag @initiator[tag=apply] add reshhotelown

tag @initiator[tag=apply] remove apply

tell @initiator[tag=reshhotelown] §aYou're now owner of the Hotel