playsound note.bassattack @initiator[tag=!realtor] ~ ~ ~

execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

playsound random.levelup @initiator[tag=realtor] ~ ~ ~

execute as @initiator[tag=realtor] run tell @s §aSelling S2002!

execute as @initiator[tag=realtor] run tell @a[tag=s2002] §aSelling S2002!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=s2002] Moneyz 500

execute as @initiator[tag=realtor] run tag @a[tag=s2002] remove s2002

execute as @initiator[tag=realtor] run tell @s §aS2002 is back on the market!
