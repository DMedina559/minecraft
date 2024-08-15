execute as @initiator[tag=!commurealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=commurealtor] run tell @s §aSelling W1003!

execute as @initiator[tag=commurealtor] run tell @a[tag=w1003-commu] §aSelling W1003!

execute as @initiator[tag=commurealtor] run scoreboard players add @a[tag=w1003-commu] Moneyz 250

execute as @initiator[tag=commurealtor] run tag @a[tag=w1003-commu] remove w1003-commu

execute as @initiator[tag=commurealtor] run tell @s §aW1003 is back on the market!
