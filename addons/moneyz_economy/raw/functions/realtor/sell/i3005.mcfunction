execute as @initiator[tag=!realtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling I3005!

execute as @initiator[tag=realtor] run tell @a[tag=i3005] §aSelling I3005!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=i3005] Moneyz 750

execute as @initiator[tag=realtor] run tag @a[tag=i3005] remove i3005

execute as @initiator[tag=realtor] run tell @s §aI3005 is back on the market!
