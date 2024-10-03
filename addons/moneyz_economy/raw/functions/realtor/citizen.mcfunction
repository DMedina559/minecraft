execute as @initiator[tag=!resident] run tell @s §cYou're not a Citizen already.

execute as @initiator[tag=resident] run tell @s §aYou're not a Citizen anymore.

execute as @initiator[tag=resident] run tag @s remove resident
