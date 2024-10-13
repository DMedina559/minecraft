playsound note.bassattack @initiator[tag=!realtor] ~ ~ ~

execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

playsound random.levelup @initiator[tag=realtor] ~ ~ ~

execute as @initiator[tag=realtor] run tell @s §aSelling I3016!

execute as @initiator[tag=realtor] run tell @a[tag=i3016] §aSelling I3016!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=i3016] Moneyz 750

execute as @initiator[tag=realtor] run tag @a[tag=i3016] remove i3016

execute as @initiator[tag=realtor] run tell @s §aI3016 is back on the market!
