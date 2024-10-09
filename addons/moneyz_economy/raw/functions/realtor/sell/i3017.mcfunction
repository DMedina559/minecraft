execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling I3017!

execute as @initiator[tag=realtor] run tell @a[tag=i3017] §aSelling I3017!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=i3017] Moneyz 750

execute as @initiator[tag=realtor] run tag @a[tag=i3017] remove i3017

execute as @initiator[tag=realtor] run tell @s §aI3017 is back on the market!
