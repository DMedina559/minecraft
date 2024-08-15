execute as @initiator[tag=!commurealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=commurealtor] run tell @s §aSelling S2001!

execute as @initiator[tag=commurealtor] run tell @a[tag=s2001-commu] §aSelling S2001!

execute as @initiator[tag=commurealtor] run scoreboard players add @a[tag=s2001-commu] Moneyz 500

execute as @initiator[tag=commurealtor] run tag @a[tag=s2001-commu] remove s2001-commu

execute as @initiator[tag=commurealtor] run tell @s §aS2001 is back on the market!
