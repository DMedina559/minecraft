execute as @initiator[tag=!reshrealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=reshrealtor] run tell @s §aSelling I3001!

execute as @initiator[tag=reshrealtor] run tell @a[tag=i3001-resh] §aSelling I3001!

execute as @initiator[tag=reshrealtor] run scoreboard players add @a[tag=i3001-resh] Moneyz 750

execute as @initiator[tag=reshrealtor] run tag @a[tag=i3001-resh] remove i3001-resh

execute as @initiator[tag=reshrealtor] run tell @s §aI3001 is back on the market!
