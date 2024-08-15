execute as @initiator[tag=!reshrealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=reshrealtor] run tell @s §aSelling I3002!

execute as @initiator[tag=reshrealtor] run tell @a[tag=i3002-resh] §aSelling I3002!

execute as @initiator[tag=reshrealtor] run scoreboard players add @a[tag=i3002-resh] Moneyz 750

execute as @initiator[tag=reshrealtor] run tag @a[tag=i3002-resh] remove i3002-resh

execute as @initiator[tag=reshrealtor] run tell @s §aI3002 is back on the market!
