execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling S2007!

execute as @initiator[tag=realtor] run tell @a[tag=s2007] §aSelling S2007!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=s2007] Moneyz 500

execute as @initiator[tag=realtor] run tag @a[tag=s2007] remove s2007

execute as @initiator[tag=realtor] run tell @s §aS2007 is back on the market!
