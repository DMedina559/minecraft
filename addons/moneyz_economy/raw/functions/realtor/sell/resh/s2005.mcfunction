execute as @initiator[tag=!reshrealtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=reshrealtor] run tell @s §aSelling S2005!

execute as @initiator[tag=reshrealtor] run tell @a[tag=s2005-resh] §aSelling S2005!

execute as @initiator[tag=reshrealtor] run scoreboard players add @a[tag=s2005-resh] Moneyz 500

execute as @initiator[tag=reshrealtor] run tag @a[tag=s2005-resh] remove s2005-resh

execute as @initiator[tag=reshrealtor] run tell @s §aS2005 is back on the market!
