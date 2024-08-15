execute as @initiator[tag=!commuresident,tag=!reshrealtor] run tell @s §cYou're not a Citizen already.

execute as @initiator[tag=reshresident] run tell @s §aYou're not a Citizen anymore.

execute as @initiator[tag=reshresident] run tag @s remove reshresident

execute as @initiator[tag=commuresident] run tell @s §aYou're not a Citizen anymore.

execute as @initiator[tag=commuresident] run tag @s remove commuresident