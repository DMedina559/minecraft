playsound note.bassattack @initiator[tag=!realtor] ~ ~ ~

execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

playsound random.levelup @initiator[tag=realtor] ~ ~ ~

execute as @initiator[tag=realtor] run tell @s §aSelling D4019!

execute as @initiator[tag=realtor] run tell @a[tag=d4019] §aSelling D4019!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=d4019] Moneyz 1000

execute as @initiator[tag=realtor] run tag @a[tag=d4019] remove d4019

execute as @initiator[tag=realtor] run tell @s §aD4019 is back on the market!
