execute as @initiator[scores={Moneyz=..29}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..29}] run tell @s §cYou can't buy 20 Glowstones!

execute as @initiator[scores={Moneyz=..29}] run tellraw @s {"rawtext": [{"text": "§cYou need 30 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=30..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=30..}] run tell @s §aYou can buy 20 Glowstones!

execute as @initiator[scores={Moneyz=30..}] run give @s glowstone 20 

execute as @initiator[scores={Moneyz=30..}] run tell @s §aPurchased 20 Glowstones!

execute as @initiator[scores={Moneyz=30..}] run scoreboard players remove @s Moneyz 30
