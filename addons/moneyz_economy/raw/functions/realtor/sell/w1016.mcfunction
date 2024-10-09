execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling W1016!

execute as @initiator[tag=realtor] run tell @a[tag=w1016] §aSelling W1016!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=w1016] Moneyz 250

execute as @initiator[tag=realtor] run tag @a[tag=w1016] remove w1016

execute as @initiator[tag=realtor] run tell @s §aW1016 is back on the market!
