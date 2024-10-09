execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling S2016!

execute as @initiator[tag=realtor] run tell @a[tag=s2016] §aSelling S2016!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=s2016] Moneyz 500

execute as @initiator[tag=realtor] run tag @a[tag=s2016] remove s2016

execute as @initiator[tag=realtor] run tell @s §aS2016 is back on the market!
