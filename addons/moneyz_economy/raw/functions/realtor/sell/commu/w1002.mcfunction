execute as @initiator[tag=!commurealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=commurealtor] run tell @s §aSelling W1002!

execute as @initiator[tag=commurealtor] run tell @a[tag=w1002-commu] §aSelling W1002!

execute as @initiator[tag=commurealtor] run scoreboard players add @a[tag=w1002-commu] Moneyz 250

execute as @initiator[tag=commurealtor] run tag @a[tag=w1002-commu] remove w1002-commu

execute as @initiator[tag=commurealtor] run tell @s §aW1002 is back on the market!
