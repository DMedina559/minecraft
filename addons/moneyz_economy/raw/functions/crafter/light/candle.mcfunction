execute as @initiator[scores={Moneyz=..39}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..39}] run tell @s §cYou can't buy 40 Candles!

execute as @initiator[scores={Moneyz=..39}] run tellraw @s {"rawtext": [{"text": "§cYou need 40 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=40..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=40..}] run tell @s §aYou can buy 40 Candles!

execute as @initiator[scores={Moneyz=40..}] run give @s candle 40 

execute as @initiator[scores={Moneyz=40..}] run tell @s §aPurchased 40 Candles!

execute as @initiator[scores={Moneyz=40..}] run scoreboard players remove @s Moneyz 40
