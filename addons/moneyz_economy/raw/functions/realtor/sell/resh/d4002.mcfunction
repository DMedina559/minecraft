execute as @initiator[tag=!reshrealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=reshrealtor] run tell @s §aSelling D4002!

execute as @initiator[tag=reshrealtor] run tell @a[tag=d4002-resh] §aSelling D4002!

execute as @initiator[tag=reshrealtor] run scoreboard players add @a[tag=d4002-resh] Moneyz 1000

execute as @initiator[tag=reshrealtor] run tag @a[tag=d4002-resh] remove d4002-resh

execute as @initiator[tag=reshrealtor] run tell @s §aD4002 is back on the market!
