execute as @initiator[tag=!commurealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=commurealtor] run tell @s §aSelling W1001!

execute as @initiator[tag=commurealtor] run tell @a[tag=w1001-commu] §aSelling W1001!

execute as @initiator[tag=commurealtor] run scoreboard players add @a[tag=w1001-commu] Moneyz 250

execute as @initiator[tag=commurealtor] run tag @a[tag=w1001-commu] remove w1001-commu

execute as @initiator[tag=commurealtor] run tell @s §aW1001 is back on the market!
