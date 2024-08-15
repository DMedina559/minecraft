execute as @initiator[tag=!commurealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=commurealtor] run tell @s §aSelling S2003!

execute as @initiator[tag=commurealtor] run tell @a[tag=s2003-commu] §aSelling S2003!

execute as @initiator[tag=commurealtor] run scoreboard players add @a[tag=s2003-commu] Moneyz 500

execute as @initiator[tag=commurealtor] run tag @a[tag=s2003-commu] remove s2003-commu

execute as @initiator[tag=commurealtor] run tell @s §aS2003 is back on the market!
