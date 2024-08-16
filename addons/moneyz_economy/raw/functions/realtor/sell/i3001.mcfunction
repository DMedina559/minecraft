execute as @initiator[tag=!realtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling I3001!

execute as @initiator[tag=realtor] run tell @a[tag=i3001] §aSelling I3001!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=i3001] Moneyz 750

execute as @initiator[tag=realtor] run tag @a[tag=i3001] remove i3001

execute as @initiator[tag=realtor] run tell @s §aI3001 is back on the market!
