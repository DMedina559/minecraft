execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling D4017!

execute as @initiator[tag=realtor] run tell @a[tag=d4017] §aSelling D4017!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=d4017] Moneyz 1000

execute as @initiator[tag=realtor] run tag @a[tag=d4017] remove d4017

execute as @initiator[tag=realtor] run tell @s §aD4017 is back on the market!
