execute as @initiator[tag=!reshrealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=reshrealtor] run tell @s §aSelling W1004!

execute as @initiator[tag=reshrealtor] run tell @a[tag=w1004-resh] §aSelling W1004!

execute as @initiator[tag=reshrealtor] run scoreboard players add @a[tag=w1004-resh] Moneyz 250

execute as @initiator[tag=reshrealtor] run tag @a[tag=w1004-resh] remove w1004-resh

execute as @initiator[tag=reshrealtor] run tell @s §aW1004 is back on the market!
