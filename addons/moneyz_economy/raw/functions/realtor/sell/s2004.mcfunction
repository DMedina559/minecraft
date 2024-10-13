playsound note.bassattack @initiator[tag=!realtor] ~ ~ ~

execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

playsound random.levelup @initiator[tag=realtor] ~ ~ ~

execute as @initiator[tag=realtor] run tell @s §aSelling S2004!

execute as @initiator[tag=realtor] run tell @a[tag=s2004] §aSelling S2004!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=s2004] Moneyz 500

execute as @initiator[tag=realtor] run tag @a[tag=s2004] remove s2004

execute as @initiator[tag=realtor] run tell @s §aS2004 is back on the market!
