execute as @initiator[scores={Moneyz=..24}] run playsound note.bassattack @s ~ ~ ~

execute as @initiator[scores={Moneyz=..24}] run tell @s §cYou can't buy a Book and Quill!

execute as @initiator[scores={Moneyz=..24}] run tellraw @s {"rawtext": [{"text": "§cYou need 25 Moneyz for this purchase\n"}, {"text": "§6You have "}, {"score":{"name": "@s","objective": "Moneyz"}}, {"text": " Moneyz"}]}

execute as @initiator[scores={Moneyz=25..}] run playsound random.levelup @s ~ ~ ~

execute as @initiator[scores={Moneyz=25..}] run tell @s §aYou can buy a Book and Quill!

execute as @initiator[scores={Moneyz=25..}] run give @s writable_book

execute as @initiator[scores={Moneyz=25..}] run tell @s §aPurchased a Book and Quill!

execute as @initiator[scores={Moneyz=25..}] run scoreboard players remove @s Moneyz 25