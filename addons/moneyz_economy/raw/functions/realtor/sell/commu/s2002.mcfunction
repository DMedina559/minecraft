execute as @initiator[tag=!commurealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=commurealtor] run tell @s §aSelling S2002!

execute as @initiator[tag=commurealtor] run tell @a[tag=s2002-commu] §aSelling S2002!

execute as @initiator[tag=commurealtor] run scoreboard players add @a[tag=s2002-commu] Moneyz 500

execute as @initiator[tag=commurealtor] run tag @a[tag=s2002-commu] remove s2002-commu

execute as @initiator[tag=commurealtor] run tell @s §aS2002 is back on the market!
