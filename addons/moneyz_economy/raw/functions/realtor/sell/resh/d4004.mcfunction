execute as @initiator[tag=!reshrealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=reshrealtor] run tell @s §aSelling D4004!

execute as @initiator[tag=reshrealtor] run tell @a[tag=d4004-resh] §aSelling D4004!

execute as @initiator[tag=reshrealtor] run scoreboard players add @a[tag=d4004-resh] Moneyz 1000

execute as @initiator[tag=reshrealtor] run tag @a[tag=d4004-resh] remove d4004-resh

execute as @initiator[tag=reshrealtor] run tell @s §aD4004 is back on the market!
