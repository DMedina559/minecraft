execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling S2020!

execute as @initiator[tag=realtor] run tell @a[tag=s2020] §aSelling S2020!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=s2020] Moneyz 500

execute as @initiator[tag=realtor] run tag @a[tag=s2020] remove s2020

execute as @initiator[tag=realtor] run tell @s §aS2020 is back on the market!
