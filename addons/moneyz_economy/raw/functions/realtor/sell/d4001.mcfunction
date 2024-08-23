execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling D4001!

execute as @initiator[tag=realtor] run tell @a[tag=d4001] §aSelling D4001!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=d4001] Moneyz 1000

execute as @initiator[tag=realtor] run tag @a[tag=d4001] remove d4001

execute as @initiator[tag=realtor] run tell @s §aD4001 is back on the market!
