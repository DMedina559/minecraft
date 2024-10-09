execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling W1017!

execute as @initiator[tag=realtor] run tell @a[tag=w1017] §aSelling W1017!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=w1017] Moneyz 250

execute as @initiator[tag=realtor] run tag @a[tag=w1017] remove w1017

execute as @initiator[tag=realtor] run tell @s §aW1017 is back on the market!
