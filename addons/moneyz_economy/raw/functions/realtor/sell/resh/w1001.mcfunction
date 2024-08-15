execute as @initiator[tag=!reshrealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=reshrealtor] run tell @s §aSelling W1001!

execute as @initiator[tag=reshrealtor] run tell @a[tag=w1001-resh] §aSelling W1001!

execute as @initiator[tag=reshrealtor] run scoreboard players add @a[tag=w1001-resh] Moneyz 250

execute as @initiator[tag=reshrealtor] run tag @a[tag=w1001-resh] remove w1001-resh

execute as @initiator[tag=reshrealtor] run tell @s §aW1001 is back on the market!
