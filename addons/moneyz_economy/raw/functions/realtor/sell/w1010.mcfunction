execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling W1010!

execute as @initiator[tag=realtor] run tell @a[tag=w1010] §aSelling W1010!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=w1010] Moneyz 250

execute as @initiator[tag=realtor] run tag @a[tag=w1010] remove w1010

execute as @initiator[tag=realtor] run tell @s §aW1010 is back on the market!
