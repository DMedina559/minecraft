execute as @initiator[tag=!realtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling I3004!

execute as @initiator[tag=realtor] run tell @a[tag=i3004] §aSelling I3004!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=i3004] Moneyz 750

execute as @initiator[tag=realtor] run tag @a[tag=i3004] remove i3004

execute as @initiator[tag=realtor] run tell @s §aI3004 is back on the market!
