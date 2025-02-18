execute as @initiator[scores={Moneyz=..24}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..24}] run tell @s §cYou can't buy 5 Cooked Porkchops!

execute as @initiator[scores={Moneyz=..24}] run tellraw @s {"rawtext": [{"text": "§cYou need 25 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=25..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou can buy 5 Cooked Porkchops!

execute as @initiator[scores={Moneyz=25..}] run give @s cooked_porkchop 5 

execute as @initiator[scores={Moneyz=25..}] run tell @s §aPurchased 5 Cooked Porkchops!

execute as @initiator[scores={Moneyz=25..}] run scoreboard players remove @s Moneyz 25
