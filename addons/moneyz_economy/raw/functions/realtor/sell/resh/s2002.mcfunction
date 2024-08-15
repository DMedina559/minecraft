execute as @initiator[tag=!reshrealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=reshrealtor] run tell @s §aSelling S2002!

execute as @initiator[tag=reshrealtor] run tell @a[tag=s2002-resh] §aSelling S2002!

execute as @initiator[tag=reshrealtor] run scoreboard players add @a[tag=s2002-resh] Moneyz 500

execute as @initiator[tag=reshrealtor] run tag @a[tag=s2002-resh] remove s2002-resh

execute as @initiator[tag=reshrealtor] run tell @s §aS2002 is back on the market!
