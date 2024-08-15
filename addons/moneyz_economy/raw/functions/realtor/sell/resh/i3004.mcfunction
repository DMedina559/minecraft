execute as @initiator[tag=!reshrealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=reshrealtor] run tell @s §aSelling I3004!

execute as @initiator[tag=reshrealtor] run tell @a[tag=i3004-resh] §aSelling I3004!

execute as @initiator[tag=reshrealtor] run scoreboard players add @a[tag=i3004-resh] Moneyz 750

execute as @initiator[tag=reshrealtor] run tag @a[tag=i3004-resh] remove i3004-resh

execute as @initiator[tag=reshrealtor] run tell @s §aI3004 is back on the market!
