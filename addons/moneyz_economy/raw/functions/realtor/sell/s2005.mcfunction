execute as @initiator[tag=!realtor] run tell @s §cYou're not autorized to sell Real Estate!

execute as @initiator[tag=realtor] run tell @s §aSelling S2005!

execute as @initiator[tag=realtor] run tell @a[tag=s2005] §aSelling S2005!

execute as @initiator[tag=realtor] run scoreboard players add @a[tag=s2005] Moneyz 500

execute as @initiator[tag=realtor] run tag @a[tag=s2005] remove s2005

execute as @initiator[tag=realtor] run tell @s §aS2005 is back on the market!
