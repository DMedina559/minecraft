playsound note.bassattack @initiator[scores={Moneyz=..999}] ~ ~ ~

execute as @initiator[scores={Moneyz=..999}] run tell @s §cYou can't buy D4003!

execute as @initiator[scores={Moneyz=..999}] run tellraw @s {"rawtext": [{"text": "§cYou need 1000 Moneyz for the downpayment\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[tag=d4003] run tell @s §cYou already own D4003!

execute as @initiator[scores={Moneyz=1000..},tag=!d4003] run tell @s §aYou can buy D4003!

execute as @initiator[scores={Moneyz=1000..},tag=!d4003] run tag @s add tmp

execute as @initiator[scores={Moneyz=1000..},tag=!d4003,tag=tmp] run scoreboard players remove @s Moneyz 1000

execute as @initiator[tag=!d4003,tag=tmp] run tag @s add d4003

execute as @initiator[tag=d4003,tag=tmp] run tag @s remove tmp

execute as @initiator[tag=d4003,tag=!resident] run tag @s add resident

execute as @initiator[tag=d4003,tag=resident] run tell @s §aPurchased D4003!
