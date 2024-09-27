execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling S2001!

execute as @initiator[tag=realtor] run tell @a[tag=s2001] §aSelling S2001!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=s2001] Moneyz 500

execute as @initiator[tag=realtor] run tag @a[tag=s2001] remove s2001

execute as @initiator[tag=realtor] run tell @s §aS2001 is back on the market!
