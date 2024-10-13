playsound note.bassattack @initiator[tag=!realtor] ~ ~ ~

execute as @initiator[tag=!realtor] run tell @s §cYou're not authorized to sell Real Estate!

playsound random.levelup @initiator[tag=realtor] ~ ~ ~

execute as @initiator[tag=realtor] run tell @s §aSelling W1019!

execute as @initiator[tag=realtor] run tell @a[tag=w1019] §aSelling W1019!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=w1019] Moneyz 250

execute as @initiator[tag=realtor] run tag @a[tag=w1019] remove w1019

execute as @initiator[tag=realtor] run tell @s §aW1019 is back on the market!
