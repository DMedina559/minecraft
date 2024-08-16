execute as @initiator[tag=!realtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling W1003!

execute as @initiator[tag=realtor] run tell @a[tag=w1003] §aSelling W1003!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=w1003] Moneyz 250

execute as @initiator[tag=realtor] run tag @a[tag=w1003] remove w1003

execute as @initiator[tag=realtor] run tell @s §aW1003 is back on the market!
