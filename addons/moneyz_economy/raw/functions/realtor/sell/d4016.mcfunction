execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling D4016!

execute as @initiator[tag=realtor] run tell @a[tag=d4016] §aSelling D4016!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=d4016] Moneyz 1000

execute as @initiator[tag=realtor] run tag @a[tag=d4016] remove d4016

execute as @initiator[tag=realtor] run tell @s §aD4016 is back on the market!
