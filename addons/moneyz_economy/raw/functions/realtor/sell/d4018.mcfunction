execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling D4018!

execute as @initiator[tag=realtor] run tell @a[tag=d4018] §aSelling D4018!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=d4018] Moneyz 1000

execute as @initiator[tag=realtor] run tag @a[tag=d4018] remove d4018

execute as @initiator[tag=realtor] run tell @s §aD4018 is back on the market!
