playsound note.bassattack @initiator[tag=!realtor] ~ ~ ~

execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

playsound random.levelup @initiator[tag=realtor] ~ ~ ~

execute as @initiator[tag=realtor] run tell @s §aSelling W1003!

execute as @initiator[tag=realtor] run tell @a[tag=w1003] §aSelling W1003!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=w1003] Moneyz 250

execute as @initiator[tag=realtor] run tag @a[tag=w1003] remove w1003

execute as @initiator[tag=realtor] run tell @s §aW1003 is back on the market!
