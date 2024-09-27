execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling W1002!

execute as @initiator[tag=realtor] run tell @a[tag=w1002] §aSelling W1002!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=w1002] Moneyz 250

execute as @initiator[tag=realtor] run tag @a[tag=w1002] remove w1002

execute as @initiator[tag=realtor] run tell @s §aW1002 is back on the market!
