execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling D4010!

execute as @initiator[tag=realtor] run tell @a[tag=d4010] §aSelling D4010!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=d4010] Moneyz 1000

execute as @initiator[tag=realtor] run tag @a[tag=d4010] remove d4010

execute as @initiator[tag=realtor] run tell @s §aD4010 is back on the market!
