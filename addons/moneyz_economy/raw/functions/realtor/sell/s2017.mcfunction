playsound note.bassattack @initiator[tag=!realtor] ~ ~ ~

execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

playsound random.levelup @initiator[tag=realtor] ~ ~ ~

execute as @initiator[tag=realtor] run tell @s §aSelling S2017!

execute as @initiator[tag=realtor] run tell @a[tag=s2017] §aSelling S2017!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=s2017] Moneyz 500

execute as @initiator[tag=realtor] run tag @a[tag=s2017] remove s2017

execute as @initiator[tag=realtor] run tell @s §aS2017 is back on the market!
