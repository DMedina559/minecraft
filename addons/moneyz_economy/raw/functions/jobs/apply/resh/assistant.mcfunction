tell @initiator §aYou've applied for Assistant

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

tag @initiator[tag=apply] add reshassistant

tag @initiator[tag=apply] remove apply

tell @initiator[tag=reshassistant] §aYou're now an Assistant in Resh