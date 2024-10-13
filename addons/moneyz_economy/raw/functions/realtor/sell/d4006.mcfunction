playsound note.bassattack @initiator[tag=!realtor] ~ ~ ~

execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

playsound random.levelup @initiator[tag=realtor] ~ ~ ~

execute as @initiator[tag=realtor] run tell @s §aSelling D4006!

execute as @initiator[tag=realtor] run tell @a[tag=d4006] §aSelling D4006!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=d4006] Moneyz 1000

execute as @initiator[tag=realtor] run tag @a[tag=d4006] remove d4006

execute as @initiator[tag=realtor] run tell @s §aD4006 is back on the market!
