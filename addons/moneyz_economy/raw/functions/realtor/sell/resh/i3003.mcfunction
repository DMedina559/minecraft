execute as @initiator[tag=!reshrealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=reshrealtor] run tell @s §aSelling I3003!

execute as @initiator[tag=reshrealtor] run tell @a[tag=i3003-resh] §aSelling I3003!

execute as @initiator[tag=reshrealtor] run scoreboard players add @a[tag=i3003-resh] Moneyz 750

execute as @initiator[tag=reshrealtor] run tag @a[tag=i3003-resh] remove i3003-resh

execute as @initiator[tag=reshrealtor] run tell @s §aI3003 is back on the market!
