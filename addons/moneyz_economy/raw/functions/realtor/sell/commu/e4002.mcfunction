execute as @initiator[tag=!commurealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=commurealtor] run tell @s §aSelling E4002!

execute as @initiator[tag=commurealtor] run tell @a[tag=e4002-commu] §aSelling E4002!

execute as @initiator[tag=commurealtor] run scoreboard players add @a[tag=e4002-commu] Moneyz 1000

execute as @initiator[tag=commurealtor] run tag @a[tag=e4002-commu] remove e4002-commu

execute as @initiator[tag=commurealtor] run tell @s §aE4002 is back on the market!
