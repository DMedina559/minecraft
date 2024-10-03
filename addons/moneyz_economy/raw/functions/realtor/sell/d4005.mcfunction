execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling D4005!

execute as @initiator[tag=realtor] run tell @a[tag=d4005] §aSelling D4005!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=d4005] Moneyz 1000

execute as @initiator[tag=realtor] run tag @a[tag=d4005] remove d4005

execute as @initiator[tag=realtor] run tell @s §aD4005 is back on the market!
