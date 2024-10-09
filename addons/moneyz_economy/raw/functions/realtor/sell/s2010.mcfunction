execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling S2010!

execute as @initiator[tag=realtor] run tell @a[tag=s2010] §aSelling S2010!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=s2010] Moneyz 500

execute as @initiator[tag=realtor] run tag @a[tag=s2010] remove s2010

execute as @initiator[tag=realtor] run tell @s §aS2010 is back on the market!
