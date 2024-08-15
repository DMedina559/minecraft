execute as @initiator[tag=!commurealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=commurealtor] run tell @s §aSelling E4005!

execute as @initiator[tag=commurealtor] run tell @a[tag=e4005-commu] §aSelling E4005!

execute as @initiator[tag=commurealtor] run scoreboard players add @a[tag=e4005-commu] Moneyz 1000

execute as @initiator[tag=commurealtor] run tag @a[tag=e4005-commu] remove e4005-commu

execute as @initiator[tag=commurealtor] run tell @s §aE4005 is back on the market!
