playsound note.bassattack @initiator[scores={Moneyz=..249}] ~ ~ ~

execute as @initiator[scores={Moneyz=..249}] run tell @s §cYou can't buy W1001!

execute as @initiator[scores={Moneyz=..249}] run tellraw @s {"rawtext": [{"text": "§cYou need 250 Moneyz for the downpayment\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[tag=w1001] run tell @s §cYou already own W1001!

execute as @initiator[scores={Moneyz=250..},tag=!w1001] run tell @s §aYou can buy W1001!

execute as @initiator[scores={Moneyz=250..},tag=!w1001] run tag @s add tmp

execute as @initiator[scores={Moneyz=250..},tag=!w1001,tag=tmp] run scoreboard players remove @s Moneyz 250

execute as @initiator[tag=!w1001,tag=tmp] run tag @s add w1001

execute as @initiator[tag=w1001,tag=tmp] run tag @s remove tmp

execute as @initiator[tag=w1001,tag=!resident] run tag @s add resident

execute as @initiator[tag=w1001,tag=resident] run tell @s §aPurchased W1001!
