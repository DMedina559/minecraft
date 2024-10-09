execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling I3006!

execute as @initiator[tag=realtor] run tell @a[tag=i3006] §aSelling I3006!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=i3006] Moneyz 750

execute as @initiator[tag=realtor] run tag @a[tag=i3006] remove i3006

execute as @initiator[tag=realtor] run tell @s §aI3006 is back on the market!
