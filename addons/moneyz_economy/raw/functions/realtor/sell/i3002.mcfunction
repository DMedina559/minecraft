playsound note.bassattack @initiator[tag=!realtor] ~ ~ ~

execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

playsound random.levelup @initiator[tag=realtor] ~ ~ ~

execute as @initiator[tag=realtor] run tell @s §aSelling I3002!

execute as @initiator[tag=realtor] run tell @a[tag=i3002] §aSelling I3002!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=i3002] Moneyz 750

execute as @initiator[tag=realtor] run tag @a[tag=i3002] remove i3002

execute as @initiator[tag=realtor] run tell @s §aI3002 is back on the market!
