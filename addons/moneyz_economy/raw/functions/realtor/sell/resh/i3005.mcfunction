execute as @initiator[tag=!reshrealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=reshrealtor] run tell @s §aSelling I3005!

execute as @initiator[tag=reshrealtor] run tell @a[tag=i3005-resh] §aSelling I3005!

execute as @initiator[tag=reshrealtor] run scoreboard players add @a[tag=i3005-resh] Moneyz 750

execute as @initiator[tag=reshrealtor] run tag @a[tag=i3005-resh] remove i3005-resh

execute as @initiator[tag=reshrealtor] run tell @s §aI3005 is back on the market!
