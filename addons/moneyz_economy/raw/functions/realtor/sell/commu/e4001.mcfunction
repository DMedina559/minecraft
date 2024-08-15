execute as @initiator[tag=!commurealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=commurealtor] run tell @s §aSelling E4001!

execute as @initiator[tag=commurealtor] run tell @a[tag=e4001-commu] §aSelling E4001!

execute as @initiator[tag=commurealtor] run scoreboard players add @a[tag=e4001-commu] Moneyz 1000

execute as @initiator[tag=commurealtor] run tag @a[tag=e4001-commu] remove e4001-commu

execute as @initiator[tag=commurealtor] run tell @s §aE4001 is back on the market!
