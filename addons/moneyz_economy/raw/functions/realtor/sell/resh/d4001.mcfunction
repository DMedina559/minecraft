execute as @initiator[tag=!reshrealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=reshrealtor] run tell @s §aSelling D4001!

execute as @initiator[tag=reshrealtor] run tell @a[tag=d4001-resh] §aSelling D4001!

execute as @initiator[tag=reshrealtor] run scoreboard players add @a[tag=d4001-resh] Moneyz 1000

execute as @initiator[tag=reshrealtor] run tag @a[tag=d4001-resh] remove d4001-resh

execute as @initiator[tag=reshrealtor] run tell @s §aD4001 is back on the market!
