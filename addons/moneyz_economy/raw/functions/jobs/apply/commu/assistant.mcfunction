tell @initiator §aYou've applied for Assistant

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

tag @initiator[tag=apply] add commuassistant

tag @initiator[tag=apply] remove apply

tell @initiator[tag=commuassistant] §aYou're now an Assistant in Commu