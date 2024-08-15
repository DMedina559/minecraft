tell @initiator §aYou've applied for Delivery Person

execute as @initiator[tag=!apply] run tell @s §cYou don't have the Apply Tag! Did you talk to the Mayor?

tag @initiator[tag=apply] add commudelivery

tag @initiator[tag=apply] remove apply

tell @initiator[tag=commudelivery] §aYou're now a Delivery Person