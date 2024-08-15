execute as @initiator[tag=!reshrealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=reshrealtor] run tell @s §aSelling W1003!

execute as @initiator[tag=reshrealtor] run tell @a[tag=w1003-resh] §aSelling W1003!

execute as @initiator[tag=reshrealtor] run scoreboard players add @a[tag=w1003-resh] Moneyz 250

execute as @initiator[tag=reshrealtor] run tag @a[tag=w1003-resh] remove w1003-resh

execute as @initiator[tag=reshrealtor] run tell @s §aW1003 is back on the market!
