execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling W1005!

execute as @initiator[tag=realtor] run tell @a[tag=w1005] §aSelling W1005!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=w1005] Moneyz 250

execute as @initiator[tag=realtor] run tag @a[tag=w1005] remove w1005

execute as @initiator[tag=realtor] run tell @s §aW1005 is back on the market!
