execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling S2006!

execute as @initiator[tag=realtor] run tell @a[tag=s2006] §aSelling S2006!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=s2006] Moneyz 500

execute as @initiator[tag=realtor] run tag @a[tag=s2006] remove s2006

execute as @initiator[tag=realtor] run tell @s §aS2006 is back on the market!
