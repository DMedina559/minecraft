execute as @initiator[scores={Moneyz=..34}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..34}] run tell @s §cYou can't buy 10 Redstone Lamps!

execute as @initiator[scores={Moneyz=..34}] run tellraw @s {"rawtext": [{"text": "§cYou need 35 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=35..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=35..}] run tell @s §aYou can buy 10 Redstone Lamps!

execute as @initiator[scores={Moneyz=35..}] run give @s redstone_lamp 10 

execute as @initiator[scores={Moneyz=35..}] run tell @s §aPurchased 10 Redstone Lamps!

execute as @initiator[scores={Moneyz=35..}] run scoreboard players remove @s Moneyz 35
