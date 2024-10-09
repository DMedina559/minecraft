execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling I3020!

execute as @initiator[tag=realtor] run tell @a[tag=i3020] §aSelling I3020!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=i3020] Moneyz 750

execute as @initiator[tag=realtor] run tag @a[tag=i3020] remove i3020

execute as @initiator[tag=realtor] run tell @s §aI3020 is back on the market!
