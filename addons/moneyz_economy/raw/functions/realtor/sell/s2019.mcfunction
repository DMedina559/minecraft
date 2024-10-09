execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling S2019!

execute as @initiator[tag=realtor] run tell @a[tag=s2019] §aSelling S2019!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=s2019] Moneyz 500

execute as @initiator[tag=realtor] run tag @a[tag=s2019] remove s2019

execute as @initiator[tag=realtor] run tell @s §aS2019 is back on the market!
