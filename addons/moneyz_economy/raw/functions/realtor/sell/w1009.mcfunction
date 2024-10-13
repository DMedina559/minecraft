playsound note.bassattack @initiator[tag=!realtor] ~ ~ ~

execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

playsound random.levelup @initiator[tag=realtor] ~ ~ ~

execute as @initiator[tag=realtor] run tell @s §aSelling W1009!

execute as @initiator[tag=realtor] run tell @a[tag=w1009] §aSelling W1009!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=w1009] Moneyz 250

execute as @initiator[tag=realtor] run tag @a[tag=w1009] remove w1009

execute as @initiator[tag=realtor] run tell @s §aW1009 is back on the market!
