execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling W1020!

execute as @initiator[tag=realtor] run tell @a[tag=w1020] §aSelling W1020!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=w1020] Moneyz 250

execute as @initiator[tag=realtor] run tag @a[tag=w1020] remove w1020

execute as @initiator[tag=realtor] run tell @s §aW1020 is back on the market!
